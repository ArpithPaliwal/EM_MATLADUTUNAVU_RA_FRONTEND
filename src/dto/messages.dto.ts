export interface MessageResponseDto {
  _id: string;
  conversationId: string;
  senderId: string;
  text?: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
}
export interface SendMessageDto {
  conversationId: string;
  senderId: string;
  text?: string;
  filePath?: string;
}


export interface MessagePage {
  messages: MessageResponseDto[];
  nextCursor: string | null;
}
