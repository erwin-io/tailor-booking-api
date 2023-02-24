/* eslint-disable @typescript-eslint/no-unused-vars */
import { Clients } from "../shared/entities/Clients";
import {
  UpdateClientProfilePictureDto,
  UpdateClientUserDto,
  UpdateStaffUserDto,
  UserDto,
} from "../core/dto/users/user.update.dto";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository } from "typeorm";
import {
  ClientUserDto,
  CreateStaffUserDto,
  StaffUserDto,
} from "../core/dto/users/user.create.dto";
import {
  compare,
  hash,
  getAge,
  isStaffRegistrationApproved,
} from "../common/utils/utils";
import { Users } from "../shared/entities/Users";
import { Gender } from "../shared/entities/Gender";
import { Staff } from "../shared/entities/Staff";
import { UserType } from "../shared/entities/UserType";
import { EntityStatus } from "../shared/entities/EntityStatus";
import { Roles } from "../shared/entities/Roles";
import { RoleEnum } from "src/common/enums/role.enum";
import { StaffViewModel } from "src/core/view-model/staff.view-model";
import { ClientViewModel } from "src/core/view-model/client.view-model";
import { UserViewModel } from "src/core/view-model/user.view-model";
import { UserTypeEnum } from "src/common/enums/user-type.enum";
import { FirebaseProvider } from "src/core/provider/firebase/firebase-provider";
import { UserProfilePic } from "src/shared/entities/UserProfilePic";
import { unlinkSync, writeFile } from "fs";
import { Files } from "src/shared/entities/Files";
import { extname, join } from "path";
import { v4 as uuid } from "uuid";
import * as moment from "moment";

@Injectable()
export class UsersService {
  constructor(
    private firebaseProvoder: FirebaseProvider,
    @InjectRepository(Users) private readonly userRepo: Repository<Users>
  ) {}

  async findAll(userTypeId: string) {
    if (Number(userTypeId) === 1) {
      const query = <Staff[]>(
        await this.userRepo.manager
          .createQueryBuilder("Staff", "s")
          .innerJoinAndSelect("s.gender", "g")
          .innerJoinAndSelect("s.user", "u")
          .innerJoinAndSelect("u.role", "r")
          .innerJoinAndSelect("u.userType", "ut")
          .getMany()
      );
      return query.map((s: Staff) => {
        return new StaffViewModel(s);
      });
    } else if (Number(userTypeId) === 2) {
      const query = <Clients[]>(
        await this.userRepo.manager
          .createQueryBuilder("Clients", "s")
          .innerJoinAndSelect("s.gender", "g")
          .innerJoinAndSelect("s.user", "u")
          .innerJoinAndSelect("u.role", "r")
          .innerJoinAndSelect("u.userType", "ut")
          .getMany()
      );
      return query.map((c: Clients) => {
        return new ClientViewModel(c);
      });
    }
  }

  async findStaffUserByFilter(
    advanceSearch: boolean,
    keyword: string,
    userId: string,
    username: string,
    roles: string[],
    email: string,
    mobileNumber: string,
    name: string
  ) {
    const params: any = {
      keyword: `%${keyword}%`,
      roles: roles.length === 0 ? ["Admin", "Front desk"] : roles,
    };
    let query = await this.userRepo.manager
      .createQueryBuilder("Staff", "s")
      .innerJoinAndSelect("s.gender", "g")
      .innerJoinAndSelect("s.user", "u")
      .innerJoinAndSelect("u.role", "r")
      .innerJoinAndSelect("u.userType", "ut");

    if (advanceSearch) {
      query = query
        .where("s.name LIKE :name")
        .andWhere("r.name IN(:...roles)")
        .andWhere("cast(u.userId as character varying) like :userId")
        .andWhere("u.username like :username")
        .andWhere("s.email like :email")
        .andWhere("cast(s.mobileNumber as character varying) like :mobileNumber")
        .orderBy("u.userId", "DESC");
      params.userId = `%${userId}%`;
      params.username = `%${username}%`;
      params.email = `%${email}%`;
      params.mobileNumber = `%${mobileNumber}%`;
      params.name = `%${name}%`;
    } else {
      query = query
        .where("r.name like :keyword")
        .orWhere("cast(u.userId as character varying) like :keyword")
        .orWhere("u.username like :keyword")
        .orWhere("s.email like :keyword")
        .orWhere("cast(s.mobileNumber as character varying) like :keyword")
        .orWhere("s.name like :keyword")
        .orderBy("u.userId", "DESC");
    }
    query = query.setParameters(params);
    return (<Staff[]>await query.getMany()).map((s: Staff) => {
      return new StaffViewModel(s);
    });
  }

  async findClientUserByFilter(
    advanceSearch: boolean,
    keyword: string,
    userId: string,
    username: string,
    email: string,
    mobileNumber: string,
    name: string
  ) {
    const params: any = {
      keyword: `%${keyword}%`,
    };
    let query = await this.userRepo.manager
      .createQueryBuilder("Clients", "c")
      .innerJoinAndSelect("c.gender", "g")
      .innerJoinAndSelect("c.user", "u")
      .innerJoinAndSelect("u.role", "r")
      .innerJoinAndSelect("u.userType", "ut");

    if (advanceSearch) {
      query = query.andWhere(
        "CONCAT(c.firstName, ' ', COALESCE(c.middleName, ''), ' ', c.lastName) LIKE :name"
      );
      query = query
        .where("cast(u.userId as character varying) like :userId")
        .andWhere("c.username like :username")
        .andWhere("c.email like :email")
        .andWhere("cast(c.mobileNumber as character varying) like :mobileNumber")
        .orderBy("u.userId", "DESC");
      params.userId = `%${userId}%`;
      params.username = `%${username}%`;
      params.email = `%${email}%`;
      params.mobileNumber = `%${mobileNumber}%`;
      params.name = `%${name}%`;
    } else {
      query = query
        .where("cast(u.userId as character varying) like :keyword")
        .orWhere("u.username like :keyword")
        .orWhere("c.email like :keyword")
        .orWhere("cast(c.mobileNumber as character varying) like :keyword")
        .orWhere("COALESCE(c.firstName, '') like :keyword")
        .orWhere("COALESCE(c.middleName, '') like :keyword")
        .orWhere("COALESCE(c.lastName, '') like :keyword")
        .orderBy("u.userId", "DESC");
    }
    query = query.setParameters(params);
    return (<Clients[]>await query.getMany()).map((c: Clients) => {
      return new ClientViewModel(c);
    });
  }

  async findOne(
    options?: any,
    sanitizeUser?: boolean,
    entityManager?: EntityManager
  ) {
    const user: any = await entityManager.findOne(Users, {
      where: options,
      relations: {
        userType: true,
        role: true,
        userProfilePic: { file: true },
      },
    });
    if (!user) {
      return;
    }
    user.hasActiveSession =
      user.currentHashedRefreshToken === null ||
      user.currentHashedRefreshToken === undefined ||
      user.currentHashedRefreshToken === ""
        ? false
        : true;
    const userTypeId = user.userType.userTypeId;
    if (Number(userTypeId) === 1) {
      const result: any = await entityManager.findOne(Staff, {
        where: {
          user: options,
        },
        relations: ["user", "gender"],
      });
      result.fullName = result.name;
      result.user.role = user.role;
      result.user = sanitizeUser ? this._sanitizeUser(user) : result.user;
      if (result.user.role.roleId === RoleEnum.GUEST.toString())
        result.user.role.roleId = null;
      if (user.userProfilePic) {
        const userProfilePic = await entityManager.findOne(UserProfilePic, {
          where: {
            userId: user.userId,
          },
          relations: ["file"],
        });
        result.user.userProfilePic = userProfilePic;
      }
      return result;
    } else {
      const result: any = await entityManager.findOne(Clients, {
        where: {
          user: options,
        },
        relations: ["user", "gender"],
      });
      result.fullName =
        result.firstName +
        " " +
        (result.MiddleName !== undefined
          ? result.MiddleName + " " + result.lastName
          : result.lastName);
      result.user.role = user.role;
      result.user = sanitizeUser ? this._sanitizeUser(user) : result.user;
      if (result.user.role.roleId === RoleEnum.GUEST.toString())
        result.user.role.roleId = null;
      if (user.userProfilePic) {
        const userProfilePic = await entityManager.findOne(UserProfilePic, {
          where: {
            userId: user.userId,
          },
          relations: ["file"],
        });
        result.user.userProfilePic = userProfilePic;
      }
      return result;
    }
  }

  async findById(userId: string) {
    const result = await this.findOne({ userId }, true, this.userRepo.manager);
    if (!result) {
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }
    return result;
  }

  async findUserById(userId: string) {
    const result = await this.userRepo.findOneBy({ userId });
    if (!result) {
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }
    return result;
  }

  async findByUsername(username) {
    const result = await this.findOne(
      { username },
      false,
      this.userRepo.manager
    );
    if (result === (null || undefined)) return null;
    return this._sanitizeUser(result.user);
  }

  async findByLogin(username, password) {
    const result = await this.findOne(
      { username },
      false,
      this.userRepo.manager
    );
    if (!result) {
      throw new HttpException("Username not found", HttpStatus.NOT_FOUND);
    }
    if (!result.user.enable) {
      throw new HttpException("Yout account has been disabled", HttpStatus.OK);
    }
    const areEqual = await compare(result.user.password, password);
    if (!areEqual) {
      throw new HttpException("Invalid credentials", HttpStatus.NOT_ACCEPTABLE);
    }
    return this._sanitizeUser(result.user);
  }

  async findByLoginStaff(username, password) {
    const result = await this.findOne(
      { username, userType: { userTypeId: 1 } },
      false,
      this.userRepo.manager
    );
    if (!result) {
      throw new HttpException("Username not found", HttpStatus.NOT_FOUND);
    }
    if (!result.user.enable) {
      throw new HttpException("Yout account has been disabled", HttpStatus.OK);
    }
    const areEqual = await compare(result.user.password, password);
    if (!areEqual) {
      throw new HttpException("Invalid credentials", HttpStatus.NOT_ACCEPTABLE);
    }
    return this._sanitizeUser(result.user);
  }

  async findByLoginCLient(username, password) {
    const result = await this.findOne(
      { username, userType: { userTypeId: 2 } },
      false,
      this.userRepo.manager
    );
    if (!result) {
      throw new HttpException("Username not found", HttpStatus.NOT_FOUND);
    }
    if (!result.user.enable) {
      throw new HttpException("Yout account has been disabled", HttpStatus.OK);
    }
    const areEqual = await compare(result.user.password, password);
    if (!areEqual) {
      throw new HttpException("Invalid credentials", HttpStatus.NOT_ACCEPTABLE);
    }
    return this._sanitizeUser(result.user);
  }

  async registerClientUser(userDto: ClientUserDto) {
    const { username } = userDto;
    return await this.userRepo.manager.transaction(async (entityManager) => {
      const userInDb = await this.findOne({ username }, false, entityManager);
      if (userInDb) {
        throw new HttpException("Username already exist", HttpStatus.CONFLICT);
      }
      let user = new Users();
      user.username = userDto.username;
      user.password = await hash(userDto.password);
      user.userType = new UserType();
      user.userType.userTypeId = UserTypeEnum.CLIENT.toString();
      user.role = new Roles();
      user.role.roleId = RoleEnum.GUEST.toString();
      user.entityStatus = new EntityStatus();
      user.entityStatus.entityStatusId = "1";
      user = await entityManager.save(Users, user);
      let client = new Clients();
      client.user = user;
      client.firstName = userDto.firstName;
      client.middleName = userDto.middleName;
      client.lastName = userDto.lastName;
      client.email = userDto.email;
      client.mobileNumber = userDto.mobileNumber;
      client.birthDate = moment(userDto.birthDate).format("YYYY-MM-DD");
      client.age = await (await getAge(new Date(userDto.birthDate))).toString();
      client.address = userDto.address;
      client.gender = new Gender();
      client.gender.genderId = userDto.genderId;
      client = await entityManager.save(Clients, client);
      client.user = await this._sanitizeUser(user);
      return client;
    });
  }

  async registerStaffUser(userDto: StaffUserDto) {
    const { username } = userDto;

    return await this.userRepo.manager.transaction(async (entityManager) => {
      const userInDb = await this.findOne({ username }, false, entityManager);
      if (userInDb) {
        throw new HttpException("Username already exist", HttpStatus.CONFLICT);
      }
      let user = new Users();
      user.username = userDto.username;
      user.password = await hash(userDto.password);
      user.userType = new UserType();
      user.userType.userTypeId = UserTypeEnum.STAFF.toString();
      user.entityStatus = new EntityStatus();
      user.role = new Roles();
      user.role.roleId = RoleEnum.GUEST.toString();
      user.entityStatus.entityStatusId = "1";
      user = await entityManager.save(Users, user);
      let staff = new Staff();
      staff.user = user;
      staff.name = userDto.name;
      staff.email = userDto.email;
      staff.mobileNumber = userDto.mobileNumber;
      staff.gender = new Gender();
      staff.gender.genderId = userDto.genderId;
      staff = await entityManager.save(Staff, staff);
      staff.user = await this._sanitizeUser(user);
      return staff;
    });
  }

  async createClientUser(userDto: ClientUserDto) {
    const { username } = userDto;

    return await this.userRepo.manager.transaction(async (entityManager) => {
      const userInDb = await this.findOne({ username }, false, entityManager);
      if (userInDb) {
        throw new HttpException("Username already exist", HttpStatus.CONFLICT);
      }
      let user = new Users();
      user.username = userDto.username;
      user.password = await hash(userDto.password);
      user.userType = new UserType();
      user.userType.userTypeId = UserTypeEnum.CLIENT.toString();
      user.entityStatus = new EntityStatus();
      user.role = new Roles();
      user.role.roleId = RoleEnum.GUEST.toString();
      user.entityStatus.entityStatusId = "1";
      user.isAdminApproved = true;
      user = await entityManager.save(Users, user);
      let client = new Clients();
      client.user = user;
      client.firstName = userDto.firstName;
      client.middleName = userDto.middleName;
      client.lastName = userDto.lastName;
      client.email = userDto.email;
      client.mobileNumber = userDto.mobileNumber;
      client.address = userDto.address;
      client.birthDate = moment(userDto.birthDate).format("YYYY-MM-DD");
      client.age = (await getAge(new Date(userDto.birthDate))).toString();
      client.gender = new Gender();
      client.gender.genderId = userDto.genderId;
      client = await entityManager.save(Clients, client);
      client.user = await this._sanitizeUser(user);
      return client;
    });
  }

  async createStaffUser(userDto: CreateStaffUserDto) {
    const { username } = userDto;

    return await this.userRepo.manager.transaction(async (entityManager) => {
      const userInDb = await this.findOne({ username }, false, entityManager);
      if (userInDb) {
        throw new HttpException("Username already exist", HttpStatus.CONFLICT);
      }
      let user = new Users();
      user.username = userDto.username;
      user.password = await hash(userDto.password);
      user.userType = new UserType();
      user.userType.userTypeId = UserTypeEnum.STAFF.toString();
      user.entityStatus = new EntityStatus();
      user.role = new Roles();
      user.role.roleId = userDto.roleId;
      user.entityStatus.entityStatusId = "1";
      user.isAdminApproved = true;
      user = await entityManager.save(Users, user);
      let staff = new Staff();
      staff.user = user;
      staff.name = userDto.name;
      staff.email = userDto.email;
      staff.mobileNumber = userDto.mobileNumber;
      staff.gender = new Gender();
      staff.gender.genderId = userDto.genderId;
      staff = await entityManager.save(Staff, staff);
      staff.user = await this._sanitizeUser(user);
      return staff;
    });
  }

  async updateClientUser(userDto: UpdateClientUserDto) {
    const userId = userDto.userId;

    return await this.userRepo.manager.transaction(async (entityManager) => {
      let client: any = await this.findOne(
        {
          userId,
          userType: { userTypeId: "2" },
        },
        true,
        entityManager
      );
      if (!client) {
        throw new HttpException(`User doesn't exist`, HttpStatus.NOT_FOUND);
      }
      const user: Users = client.user;
      client.firstName = userDto.firstName;
      client.middleName = userDto.middleName;
      client.lastName = userDto.lastName;
      client.email = userDto.email;
      client.mobileNumber = userDto.mobileNumber;
      client.birthDate = userDto.birthDate;
      client.age = await (await getAge(userDto.birthDate)).toString();
      client.address = userDto.address;
      client.gender = new Gender();
      client.gender.genderId = userDto.genderId;
      await entityManager.save(Clients, client);
      client = await this.findOne({ userId }, true, entityManager);

      return client;
    });
  }

  async updateClientProfilePicture(dto: UpdateClientProfilePictureDto) {
    const userId = dto.userId;
    return await this.userRepo.manager.transaction(async (entityManager) => {
      let client: any = await this.findOne(
        {
          userId,
          userType: { userTypeId: "2" },
        },
        true,
        entityManager
      );
      if (!client) {
        throw new HttpException(`User doesn't exist`, HttpStatus.NOT_FOUND);
      }
      const user: Users = client.user;
      if (dto.userProfilePic) {
        const newFileName: string = uuid();
        let userProfilePic = await entityManager.findOne(UserProfilePic, {
          where: { userId: user.userId },
          relations: ["file"],
        });
        const bucket = this.firebaseProvoder.app.storage().bucket();
        if (userProfilePic) {
          try {
            const deleteFile = bucket.file(
              `profile/${userProfilePic.file.fileName}`
            );
            deleteFile.delete();
          } catch (ex) {
            console.log(ex);
          }
          const file = userProfilePic.file;
          file.fileName = `${newFileName}${extname(
            dto.userProfilePic.fileName
          )}`;

          const bucketFile = bucket.file(
            `profile/${newFileName}${extname(dto.userProfilePic.fileName)}`
          );
          const img = Buffer.from(dto.userProfilePic.data, "base64");
          return await bucketFile.save(img).then(async (res) => {
            console.log("res");
            console.log(res);
            const url = await bucketFile.getSignedUrl({
              action: "read",
              expires: "03-09-2500",
            });

            file.url = url[0];
            userProfilePic.file = await entityManager.save(Files, file);
            user.userProfilePic = await entityManager.save(
              UserProfilePic,
              userProfilePic
            );
            client = await this.findOne({ userId }, true, entityManager);
            return client;
          });
        } else {
          userProfilePic = new UserProfilePic();
          userProfilePic.user = user;
          const file = new Files();
          file.fileName = `${newFileName}${extname(
            dto.userProfilePic.fileName
          )}`;
          const bucketFile = bucket.file(
            `profile/${newFileName}${extname(dto.userProfilePic.fileName)}`
          );
          const img = Buffer.from(dto.userProfilePic.data, "base64");
          return await bucketFile.save(img).then(async () => {
            const url = await bucketFile.getSignedUrl({
              action: "read",
              expires: "03-09-2500",
            });
            file.url = url[0];
            userProfilePic.file = await entityManager.save(Files, file);
            user.userProfilePic = await entityManager.save(
              UserProfilePic,
              userProfilePic
            );
            return await this.findOne({ userId }, true, entityManager);
          });
        }
      }
    });
  }

  async updateStaffUser(userDto: UpdateStaffUserDto) {
    const userId = userDto.userId;

    return await this.userRepo.manager.transaction(async (entityManager) => {
      let staff: Staff = await this.findOne(
        {
          userId,
          userType: { userTypeId: "1" },
        },
        true,
        entityManager
      );

      if (!staff) {
        throw new HttpException(`User doesn't exist`, HttpStatus.NOT_FOUND);
      }
      let user: Users = staff.user;
      user.role.roleId = userDto.roleId;
      user.isAdminApproved = isStaffRegistrationApproved(
        Number(userDto.roleId)
      );
      user = await entityManager.save(Users, user);
      staff.name = userDto.name;
      staff.email = userDto.email;
      staff.mobileNumber = userDto.mobileNumber;
      staff.gender = new Gender();
      staff.gender.genderId = userDto.genderId;

      if (userDto.userProfilePic) {
        const newFileName: string = uuid();
        let userProfilePic = await entityManager.findOne(UserProfilePic, {
          where: { userId: user.userId },
          relations: ["file"],
        });
        const bucket = this.firebaseProvoder.app.storage().bucket();
        if (userProfilePic) {
          try {
            const deleteFile = bucket.file(
              `profile/${userProfilePic.file.fileName}`
            );
            deleteFile.delete();
          } catch (ex) {
            console.log(ex);
          }
          const file = userProfilePic.file;
          file.fileName = `${newFileName}${extname(
            userDto.userProfilePic.fileName
          )}`;

          const bucketFile = bucket.file(
            `profile/${newFileName}${extname(userDto.userProfilePic.fileName)}`
          );
          const img = Buffer.from(userDto.userProfilePic.data, "base64");
          await bucketFile.save(img).then(async () => {
            const url = await bucketFile.getSignedUrl({
              action: "read",
              expires: "03-09-2500",
            });
            file.url = url[0];
            userProfilePic.file = await entityManager.save(Files, file);
          });
        } else {
          userProfilePic = new UserProfilePic();
          userProfilePic.user = user;
          const file = new Files();
          file.fileName = `${newFileName}${extname(
            userDto.userProfilePic.fileName
          )}`;

          const bucketFile = bucket.file(
            `profile/${newFileName}${extname(userDto.userProfilePic.fileName)}`
          );
          const img = Buffer.from(userDto.userProfilePic.data, "base64");
          await bucketFile.save(img).then(async () => {
            const url = await bucketFile.getSignedUrl({
              action: "read",
              expires: "03-09-2500",
            });
            file.url = url[0];
            userProfilePic.file = await entityManager.save(Files, file);
          });
        }
        user.userProfilePic = await entityManager.save(
          UserProfilePic,
          userProfilePic
        );
      }

      await entityManager.save(Staff, staff);
      staff = await this.findOne({ userId }, true, entityManager);

      return staff;
    });
  }

  async getRefreshTokenUserById(userId: string) {
    const result = await this.findOne({ userId }, false, this.userRepo.manager);
    if (!result) {
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }
    return {
      userId: result.user.userId,
      refresh_token: result.user.currentHashedRefreshToken,
    };
  }

  async setCurrentRefreshToken(
    currentHashedRefreshToken: string,
    userId: number
  ) {
    await this.userRepo.update(userId, {
      currentHashedRefreshToken,
    });
  }

  async toggleEnable(enable: boolean, userId: number) {
    await this.userRepo.update(userId, {
      enable,
    });

    return await this.findOne({ userId }, true, this.userRepo.manager);
  }

  async updateFirebaseToken(userId: string, firebaseToken: string) {
    if (firebaseToken && firebaseToken !== "") {
      this.firebaseProvoder.app
        .messaging()
        .subscribeToTopic([firebaseToken], "announcements");
    }
    await this.userRepo.update(userId, {
      firebaseToken,
    });

    return await this.findOne({ userId }, true, this.userRepo.manager);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    return await this.userRepo.manager.transaction(async (entityManager) => {
      let user: Users = await entityManager.findOne(Users, {
        where: {
          userId,
        },
      });

      if (!user) {
        throw new HttpException(`User doesn't exist`, HttpStatus.NOT_FOUND);
      }

      const areEqual = await compare(user.password, currentPassword);
      if (!areEqual) {
        throw new HttpException(
          "Password not match",
          HttpStatus.NOT_ACCEPTABLE
        );
      }

      (user.password = await hash(newPassword)),
        (user = await entityManager.save(Users, user));
      return this._sanitizeUser(user);
    });
  }

  async updatePassword(userId: string, password: string) {
    await this.userRepo.update(userId, {
      password: await hash(password),
    });

    return await this.findOne({ userId }, true, this.userRepo.manager);
  }

  private _sanitizeUser(user: Users) {
    delete user.password;
    delete user.currentHashedRefreshToken;
    return user;
  }
}
