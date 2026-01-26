import { Controller, Get, Post, Body, Patch, Param, UseGuards, Delete, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UniversitiesService } from './universities.service';
import { CreateUniversityDto, UpdateUniversityDto } from './university.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupabaseService } from '../supabase/supabase.service';
import * as path from 'path';

@Controller('universities')
export class UniversitiesController {
  constructor(
    private readonly universitiesService: UniversitiesService,
    private readonly supabaseService: SupabaseService
  ) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createUniversityDto: CreateUniversityDto) {
    return this.universitiesService.create(createUniversityDto);
  }

  // Public endpoint for registration to fetch list
  @Get()
  findAll() {
    return this.universitiesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUniversityDto: UpdateUniversityDto) {
    return this.universitiesService.update(+id, updateUniversityDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/logo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(@Param('id') id: string, @UploadedFile() file: any) {
    const ext = path.extname(file.originalname) || '.png';
    const filename = `uni_${Date.now()}${ext}`;

    // Upload to 'universities' folder in Supabase bucket
    const publicUrl = await this.supabaseService.uploadFile('universities', filename, file.buffer, file.mimetype);

    const updated = await this.universitiesService.update(+id, { logo_url: publicUrl } as any);
    return { success: true, logo_url: publicUrl, university: updated };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.universitiesService.remove(+id);
  }
}
