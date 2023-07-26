// upload.service.ts

import { Injectable } from '@nestjs/common';
import { UploadApiResponse, v2 } from 'cloudinary';
import { unlink } from 'fs/promises';
@Injectable()
export class UploadImageService {
    constructor() {
        v2.config({
            cloud_name: 'dplgegcm0',
            api_key: '939188532362112',
            api_secret: 'c3POoUKTNlpTdQNzSnZOo2aURp0',
        });
    }

    async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
        try {
            const result: UploadApiResponse = await v2.uploader.upload(file.path); // Tải lên tệp lưu trữ tạm thời
            await unlink(file.path)
            return result; // Trả về URL của hình ảnh đã tải lên
        } catch (error) {
            throw new Error('Error when upload image');
        }
    }
}
