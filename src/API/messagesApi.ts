import api from "../utils/axiosinstanceChat.js";
import { AxiosError } from "axios";
import type {ApiError} from "../dto/apiError"
import type { MessagePage, MessageResponseDto } from "../dto/messages.dto.js";
import { createFormData } from "../utils/createFormData.js";



export const  getMessages= async (conversationId:string,cursor:string | null ):Promise<MessagePage> =>{
    try {
      console.log("sent succe");
        const query = cursor ? `?cursor=${cursor}` : "";

         const res = await api.get(`/chat/messages/getMessages/${conversationId}${query}`);
      console.log("check");
    
    console.log(res);
    
    
    return res.data.data ;
    } catch (error:unknown) {
        

    if (error instanceof AxiosError && error?.response) {
      const apiError: ApiError = {
        status: error.response.status,
        message: error.response.data.message,
        errors: error.response.data.errors || [],
      };

      throw apiError;
    }

    throw {
      status: 500,
      message: "Network error or server is down",
      errors: [],
    } as ApiError;
    }
}


export const uploadMedia = async (
   payload: { file: File; text: string; conversationId: string }
): Promise<MessageResponseDto> => {
  try{
  const form = createFormData({
    attachment: payload.file,          
    text: payload.text,
    conversationId: payload.conversationId,
  });

  const res = await api.post(
    "/chat/messages/sendMessage",
    form,
    
  );
  console.log("returned data",res.data.data);
  
  return res.data.data; 
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response) {
      const apiError: ApiError = {
        status: error.response.status,
        message: error.response.data.message,
        errors: error.response.data.errors || [],
      };

      throw apiError;
    }

    throw {
      status: 500,
      message: "Network error or server is down",
      errors: [],
    } as ApiError;
  }
};
