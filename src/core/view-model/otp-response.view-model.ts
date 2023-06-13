export class OtpResponseViewModel {
    messages?: OtpResponseMessageViewModel[];
    requestError?: OtpResponseRequestErrorViewModel;
  }
  
  export class OtpResponseMessageViewModel {
    messageId: string
    status: OtpResponseStatusViewModel
    to: string
  }
  
  export class OtpResponseStatusViewModel {
    description: string
    groupId: number
    groupName: string
    id: number
    name: string
  }
  
  export class OtpResponseRequestErrorViewModel {
    serviceException: OtpResponseServiceExceptionViewModel
  }
  
  export class OtpResponseServiceExceptionViewModel {
    messageId: string
    text: string
  }
  