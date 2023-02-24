import { Body, Controller, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { CustomResponse } from "src/common/helper/customresponse.helpers";
import {
  CreateBaptismalCertificateRequestDto,
  CreateConfirmationCertificateRequesDto,
  CreateMarriageContractCertificateRequesDto,
} from "src/core/dto/request/request.create.dto";
import { UpdateRequestStatusDto } from "src/core/dto/request/request.update.dtos";
import { RequestService } from "src/services/request.service";

@ApiTags("request")
@Controller("request")
@ApiBearerAuth()
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Get("getByStatus")
  @ApiQuery({ name: "clientId", required: false })
  @ApiQuery({ name: "requestStatus", required: false })
  //@UseGuards(JwtAuthGuard)
  async getByStatus(
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Query("clientId") clientId: string = "",
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Query("requestStatus")
    requestStatus: string = ""
  ) {
    const res: CustomResponse = {};
    try {
      res.data = await this.requestService.getByStatus(
        clientId,
        requestStatus.trim() === "" ? [] : requestStatus.split(",")
      );
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Get("getByAdvanceSearch")
  @ApiQuery({ name: "isAdvance", required: false })
  @ApiQuery({ name: "keyword", required: false })
  @ApiQuery({ name: "clientName", required: false })
  @ApiQuery({ name: "requestStatus", required: false })
  @ApiQuery({ name: "requestType", required: false })
  @ApiQuery({ name: "requestDateFrom", type: Date, required: false })
  @ApiQuery({ name: "requestDateTo", required: false })
  //@UseGuards(JwtAuthGuard)
  async getByAdvanceSearch(
    @Query("isAdvance") isAdvance: boolean,
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Query("keyword") keyword: string = "",
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Query("clientName") clientName: string = "",
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Query("requestStatus")
    requestStatus: string = "",
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Query("requestType") requestType: string = "",
    @Query("requestDateFrom") requestDateFrom: Date,
    @Query("requestDateTo") requestDateTo: Date
  ) {
    const res: CustomResponse = {};
    try {
      res.data = await this.requestService.findByFilter(
        isAdvance,
        keyword,
        clientName,
        requestStatus.trim() === "" ? [] : requestStatus.split(","),
        requestType.trim() === "" ? [] : requestType.split(","),
        requestDateFrom,
        requestDateTo
      );
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Get(":requestId")
  //@UseGuards(JwtAuthGuard)
  async getById(@Param("requestId") requestId: string) {
    const res: CustomResponse = {};
    try {
      res.data = await this.requestService.findById(requestId);
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Post("createBaptismalCertificateRequest")
  //@UseGuards(JwtAuthGuard)
  async createBaptismalCertificateRequest(
    @Body() dto: CreateBaptismalCertificateRequestDto
  ) {
    const res: CustomResponse = {};
    try {
      const res: CustomResponse = {};
      res.data = await this.requestService.createBaptismalCertificateRequest(
        dto
      );
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Post("createConfirmationCertificateReques")
  //@UseGuards(JwtAuthGuard)
  async createConfirmationCertificateReques(
    @Body() dto: CreateConfirmationCertificateRequesDto
  ) {
    const res: CustomResponse = {};
    try {
      const res: CustomResponse = {};
      res.data = await this.requestService.createConfirmationCertificateReques(
        dto
      );
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Post("createMarriageContractCertificateReques")
  //@UseGuards(JwtAuthGuard)
  async createMarriageContractCertificateReques(
    @Body() dto: CreateMarriageContractCertificateRequesDto
  ) {
    const res: CustomResponse = {};
    try {
      const res: CustomResponse = {};
      res.data = await this.requestService.createMarriageContractCertificateReques(dto);
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Put("updateRequestStatus")
  //@UseGuards(JwtAuthGuard)
  async updateRequestStatus(@Body() dto: UpdateRequestStatusDto) {
    const res: CustomResponse = {};
    try {
      const res: CustomResponse = {};
      res.data = await this.requestService.updateStatus(dto);
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }
}
