import axios from "axios";

export class ResponseInterface {
  constructor(code: number, data: any) {
    this.code = code;
    this.data = data;
  }
  code: number;
  data: any;
}

async function WAIT(time: any) {
  await new Promise((r) => setTimeout(r, time))
}

export async function GetSurvey(link: string): Promise<ResponseInterface>{
  try {
    var result = await axios.get('forms/getsurvey/'+link);
    return {code: result.status, data: result.data};
  } catch (error:any) {
    return {code: error.response.status, data: error.response.data}
  }
}

interface SendResponseI {
  _id: string,
  surveyId: string,
  answers: any,
  sentDate: string
}

export async function SendResponse (body: SendResponseI): Promise<ResponseInterface>{
  try {
    var result = await axios.post('forms/sendresponse', body);
    return {code: result.status, data: result.data};
  } catch (error:any) {
    return {code: error.response.status, data: error.response.data}
  }
}