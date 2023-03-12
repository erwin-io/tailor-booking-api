import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiProperty,
  ApiBody,
  ApiConsumes,
} from "@nestjs/swagger";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { IsNotEmpty } from "class-validator";
import { createReadStream } from "fs";
import { extname, join } from "path";
import { Response } from "express";
import { UpdateCustomerProfilePictureDto } from "src/core/dto/users/user.update.dto";
import { JwtAuthGuard } from "src/core/auth/jwt.auth.guard";

export class FileDto {
  @ApiProperty()
  @IsNotEmpty()
  fileName: string;
}
@ApiTags("file")
@Controller("file")
@ApiBearerAuth("jwt")
export class FileController {
  constructor() {}
  @Get(":fileName")
  @UseGuards(JwtAuthGuard)
  async getFile(@Param("fileName") fileName: string, @Res() res: Response) {
    try {
      // const file = createReadStream(
      //   join(process.cwd(), "./uploads/profile/" + fileName)
      // ).on("error", function (err) {
      //   res.status(404);
      //   res.json({ message: err.message });
      // });
      // file.pipe(res);
    } catch (ex) {
      res.json({ message: ex.message });
    }
  }

  @Put("upload")
  @UseGuards(JwtAuthGuard)
  async upload(
    @UploadedFile() dto: UpdateCustomerProfilePictureDto,
    @Res() res: Response
  ) {
    try {
      // const base64 = dto.userProfilePic.data.split(",")[1];
      // const img = Buffer.from(base64, "base64");

      // res.writeHead(200, {
      //   "Content-Type": "image/png",
      //   "Content-Length": img.length,
      // });
      // res.send(img);
      res.contentType("image/jpeg");
      res.send(Buffer.from(dto.userProfilePic.data));
    } catch (ex) {
      res.json({ message: ex.message });
    }
  }
}
