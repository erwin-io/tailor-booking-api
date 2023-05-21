import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from "moment";
import { DateConstant } from 'src/common/constant/date.constant';
import { ActivityTypeEnum } from 'src/common/enums/activity-type.enum';
import { EntityStatusEnum } from 'src/common/enums/entity-status.enum';
import { ActivityLog } from 'src/shared/entities/ActivityLog';
import { ActivityType } from 'src/shared/entities/ActivityType';
import { Users } from 'src/shared/entities/Users';
import { Between, EntityManager, Not, Repository } from 'typeorm';
import { UsersService } from './users.service';

@Injectable()
export class ActivityLogService {
    constructor(
      @InjectRepository(ActivityLog)
      private readonly activityLogRepo: Repository<ActivityLog>,
      private readonly usersService: UsersService,
    ) {}
    async findByFilter(
        userTypeId: string,
        activityTypeId: string[],
        name: string,
        dateFrom: Date,
        dateTo: Date) {
      try {
        const params: any = {
            activityTypeId: activityTypeId.length === 0 ? [
                ActivityTypeEnum.USER_LOGIN.toString(), 
                ActivityTypeEnum.USER_LOGOUT.toString()
            ] : activityTypeId,
            userTypeId,
            name: `%${name.toLowerCase()}%`,
        };
        dateFrom = new Date(dateFrom.setHours(0,0,0,0));
        dateTo = new Date(new Date(dateTo.setDate(dateFrom.getDate() + 1)).setHours(0,0,0,0));
        params.dateFrom = moment(dateFrom, DateConstant.DATE_LANGUAGE).format("YYYY-MM-DD HH:mm:ss");
        params.dateTo = moment(dateTo, DateConstant.DATE_LANGUAGE).format("YYYY-MM-DD HH:mm:ss");
        const query = await this.activityLogRepo.manager
        .createQueryBuilder("ActivityLog", "al")
        .leftJoinAndSelect("al.activityType", "at")
        .leftJoinAndSelect("al.user", "u")
        .leftJoinAndSelect("u.staff", "s")
        .leftJoinAndSelect("u.userType", "ut")
        .where(
            "(LOWER(u.username) LIKE :name OR " + 
            "LOWER(s.name) LIKE :name) AND " + 
            "(al.date between :dateFrom AND :dateTo) AND " +
            "at.activityTypeId IN(:...activityTypeId) AND " +
            "ut.userTypeId = :userTypeId"
        )
        .orderBy("al.date", "DESC")
        .setParameters(params)
        .getMany();
        return query.map((x: ActivityLog)=> {
            delete x.user.password;
            delete x.user.currentHashedRefreshToken;
            delete x.user.firebaseToken;
            delete x.user.isAdminApproved;
            delete x.user.enable;
            return x;
        })
      } catch (e) {
        throw e;
      }
    }

    async log(activityTypeId: string, userId: string, date: Date, os: string, osVersion: string, browser: string) {
      try {
        date = new Date(moment(date, DateConstant.DATE_LANGUAGE).format("YYYY-MM-DD HH:mm:ss"));
        return await this.activityLogRepo.manager.transaction(async (entityManager) => {
            //login
            if(Number(activityTypeId) === Number(ActivityTypeEnum.USER_LOGIN)) {
                return this.userLogin(entityManager, userId, date, os, osVersion, browser)
            } else if(Number(activityTypeId) === Number(ActivityTypeEnum.USER_LOGOUT)) {
                return this.userLogout(entityManager, userId, date, os, osVersion, browser)
            }
        });
      } catch (e) {
        throw e;
      }
    }

    async userLogin(entityManager: EntityManager, userId: string, date: Date, os: string, osVersion: string, browser: string) {
        const activityTypeId = ActivityTypeEnum.USER_LOGIN.toString();
        let activityLog = new ActivityLog();
        const lastActivitySameDevice = await entityManager.find(ActivityLog, 
        {
            where: {
                user: { userId },
                os,
                osVersion,
                browser,
                },
            order: {
                date: {
                    direction: "DESC"
                }
            },
            relations: {
                activityType: true
            }
        });
        const lastActivityOtherDevice = await entityManager.find(ActivityLog, 
        {
            where: [
                {
                    user: { userId },
                    os: Not(os),
                    osVersion: osVersion,
                    browser: browser,
                },
                {
                    user: { userId },
                    os: os,
                    osVersion: Not(osVersion),
                    browser: browser,
                },
                {
                    user: { userId },
                    os: os,
                    osVersion: osVersion,
                    browser: Not(browser),
                },
            ],
            order: {
                date: {
                    direction: "DESC"
                }
            },
            relations: {
                activityType: true
            }
        });
        if(lastActivitySameDevice[0] && lastActivitySameDevice[0].activityType.activityTypeId === ActivityTypeEnum.USER_LOGOUT.toString() 
        && (!lastActivityOtherDevice[0] && lastActivityOtherDevice[0] === undefined)) {
            activityLog = new ActivityLog();
            activityLog.activityType = await entityManager.findOne(ActivityType, {where: { activityTypeId: activityTypeId }})
            activityLog.user = await entityManager.findOne(Users, {where: { userId: userId }})
            activityLog.date = date;
            activityLog.os = os;
            activityLog.osVersion = osVersion;
            activityLog.browser = browser;
            activityLog = await entityManager.save(ActivityLog, activityLog);
        } else if(lastActivitySameDevice[0] && lastActivitySameDevice[0].activityType.activityTypeId === ActivityTypeEnum.USER_LOGOUT.toString() 
        && lastActivityOtherDevice[0] && lastActivityOtherDevice[0].activityType.activityTypeId === ActivityTypeEnum.USER_LOGIN.toString() ) {
            activityLog = new ActivityLog();
            activityLog.activityType = await entityManager.findOne(ActivityType, {where: { activityTypeId: ActivityTypeEnum.USER_LOGOUT.toString()  }})
            activityLog.user = await entityManager.findOne(Users, {where: { userId: userId }})
            activityLog.date = date;
            activityLog.os = lastActivityOtherDevice[0].os;
            activityLog.osVersion = lastActivityOtherDevice[0].osVersion;
            activityLog.browser = lastActivityOtherDevice[0].browser;
            activityLog = await entityManager.save(ActivityLog, activityLog);

            await this.usersService.setCurrentRefreshToken(null, Number(userId));
            
            activityLog = new ActivityLog();
            activityLog.activityType = await entityManager.findOne(ActivityType, {where: { activityTypeId: activityTypeId }})
            activityLog.user = await entityManager.findOne(Users, {where: { userId: userId }})
            activityLog.date = date;
            activityLog.os = os;
            activityLog.osVersion = osVersion;
            activityLog.browser = browser;
            activityLog = await entityManager.save(ActivityLog, activityLog);
        } else if(lastActivitySameDevice[0] && lastActivitySameDevice[0].activityType.activityTypeId === ActivityTypeEnum.USER_LOGIN.toString()) {
            activityLog = lastActivitySameDevice[0];
            activityLog.date = date;
            activityLog = await entityManager.save(ActivityLog, activityLog);
        } else if((!lastActivitySameDevice[0] || !lastActivitySameDevice[0] === undefined) && lastActivityOtherDevice[0] 
        && (lastActivityOtherDevice[0].os !== os || lastActivityOtherDevice[0].osVersion !== osVersion || lastActivityOtherDevice[0].browser !== browser)
        && lastActivityOtherDevice[0].activityType.activityTypeId === ActivityTypeEnum.USER_LOGOUT.toString()) {
            activityLog = new ActivityLog();
            activityLog.activityType = await entityManager.findOne(ActivityType, {where: { activityTypeId: activityTypeId }})
            activityLog.user = await entityManager.findOne(Users, {where: { userId: userId }})
            activityLog.date = date;
            activityLog.os = os;
            activityLog.osVersion = osVersion;
            activityLog.browser = browser;
            activityLog = await entityManager.save(ActivityLog, activityLog);
        } else if((!lastActivitySameDevice[0] || !lastActivitySameDevice[0] === undefined) && lastActivityOtherDevice[0] 
        && (lastActivityOtherDevice[0].os !== os || lastActivityOtherDevice[0].osVersion !== osVersion || lastActivityOtherDevice[0].browser !== browser)
        && lastActivityOtherDevice[0].activityType.activityTypeId === ActivityTypeEnum.USER_LOGIN.toString()) {
            activityLog = new ActivityLog();
            activityLog.activityType = await entityManager.findOne(ActivityType, {where: { activityTypeId: ActivityTypeEnum.USER_LOGOUT.toString() }})
            activityLog.user = await entityManager.findOne(Users, {where: { userId: userId }})
            activityLog.date = date;
            activityLog.os = lastActivityOtherDevice[0].os;
            activityLog.osVersion = lastActivityOtherDevice[0].osVersion;
            activityLog.browser = lastActivityOtherDevice[0].browser;
            activityLog = await entityManager.save(ActivityLog, activityLog);

            await this.usersService.setCurrentRefreshToken(null, Number(userId));

            activityLog = new ActivityLog();
            activityLog.activityType = await entityManager.findOne(ActivityType, {where: { activityTypeId: activityTypeId }})
            activityLog.user = await entityManager.findOne(Users, {where: { userId: userId }})
            activityLog.date = date;
            activityLog.os = os;
            activityLog.osVersion = osVersion;
            activityLog.browser = browser;
            activityLog = await entityManager.save(ActivityLog, activityLog);
        } else {
            activityLog = new ActivityLog();
            activityLog.activityType = await entityManager.findOne(ActivityType, {where: { activityTypeId: activityTypeId }})
            activityLog.user = await entityManager.findOne(Users, {where: { userId: userId }})
            activityLog.date = date;
            activityLog.os = os;
            activityLog.osVersion = osVersion;
            activityLog.browser = browser;
            activityLog = await entityManager.save(ActivityLog, activityLog);
        }
        return activityLog;
    }

    async userLogout(entityManager: EntityManager, userId: string, date: Date, os: string, osVersion: string, browser: string) {
        const activityTypeId = ActivityTypeEnum.USER_LOGOUT.toString();
        let activityLog = new ActivityLog();
        
        const lastActivitySameDevice = await entityManager.find(ActivityLog, 
        {
            where: {
                user: { userId },
                os,
                osVersion,
                browser,
                },
            order: {
                date: {
                    direction: "DESC"
                }
            },
            relations: {
                activityType: true
            }
        });
        const lastActivityOtherDevice = await entityManager.find(ActivityLog, 
        {
            where: [
                {
                    user: { userId },
                },
                {
                    os: Not(os),
                },
                {
                    osVersion: Not(osVersion),
                },
                {
                    browser: Not(browser),
                },
            ],
            order: {
                date: {
                    direction: "DESC"
                }
            },
            relations: {
                activityType: true
            }
        });
        
        if(lastActivitySameDevice[0] && lastActivitySameDevice[0].activityType.activityTypeId === ActivityTypeEnum.USER_LOGIN.toString()) {
            activityLog = new ActivityLog();
            activityLog.activityType = await entityManager.findOne(ActivityType, {where: { activityTypeId: activityTypeId }})
            activityLog.user = await entityManager.findOne(Users, {where: { userId: userId }})
            activityLog.date = date;
            activityLog.os = os;
            activityLog.osVersion = osVersion;
            activityLog.browser = browser;
            activityLog = await entityManager.save(ActivityLog, activityLog);

            await this.usersService.setCurrentRefreshToken(null, Number(userId));
        } else if((!lastActivitySameDevice[0] || !lastActivitySameDevice[0] === undefined) 
        && lastActivityOtherDevice[0]
        && (lastActivityOtherDevice[0].os !== os || lastActivityOtherDevice[0].osVersion !== osVersion || lastActivityOtherDevice[0].browser !== browser)
        && lastActivityOtherDevice[0].activityType.activityTypeId === ActivityTypeEnum.USER_LOGIN.toString()) {
            activityLog = new ActivityLog();
            activityLog.activityType = await entityManager.findOne(ActivityType, {where: { activityTypeId: activityTypeId }})
            activityLog.user = await entityManager.findOne(Users, {where: { userId: userId }})
            activityLog.date = date;
            activityLog.os = os;
            activityLog.osVersion = osVersion;
            activityLog.browser = browser;
            activityLog = await entityManager.save(ActivityLog, activityLog);

            await this.usersService.setCurrentRefreshToken(null, Number(userId));
        }
        return activityLog;
    }

}
