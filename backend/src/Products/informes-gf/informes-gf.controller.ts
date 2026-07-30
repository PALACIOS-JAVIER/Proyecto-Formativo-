import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { InformesGfService } from './informes-gf.service';

const pdfUploadOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = join(process.cwd(), 'uploads', 'informes-gf');
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const fileExt = extname(file.originalname);
      const name = `informe-gf-${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
      cb(null, name);
    },
  }),
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype !== 'application/pdf' && !file.originalname.toLowerCase().endsWith('.pdf')) {
      return cb(new BadRequestException('Solo se permiten archivos en formato PDF (.pdf)'), false);
    }
    cb(null, true);
  },
};

@Controller('informes-gf')
export class InformesGfController {
  constructor(private readonly informesGfService: InformesGfService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', pdfUploadOptions))
  uploadInforme(
    @UploadedFile() file: any,
    @Body('mes') mes: string,
    @Body('anio') anio: number,
    @Body('id_usuario') id_usuario: number,
  ) {
    if (!file) {
      throw new BadRequestException('Debes adjuntar un archivo PDF válido');
    }

    const archivo_url = `uploads/informes-gf/${file.filename}`;
    return this.informesGfService.createWithFile({
      mes,
      anio: Number(anio),
      id_usuario: Number(id_usuario),
      archivo_url,
    });
  }

  @Get()
  findAll() {
    return this.informesGfService.findAll();
  }

  @Get('usuario/:userId')
  findByUsuario(@Param('userId') userId: string) {
    return this.informesGfService.findByUsuario(+userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.informesGfService.findOne(+id);
  }

  @Patch(':id/estado')
  updateEstado(@Param('id') id: string, @Body('estado') estado: string) {
    return this.informesGfService.updateEstado(+id, estado);
  }

  @Post(':id/observacion')
  addObservacion(
    @Param('id') id: string,
    @Body('comentario') comentario: string,
    @Body('coordinadorId') coordinadorId?: number,
  ) {
    if (!comentario || !comentario.trim()) {
      throw new BadRequestException('El comentario de observación es obligatorio');
    }
    return this.informesGfService.addObservacion(+id, comentario, coordinadorId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.informesGfService.remove(+id);
  }
}
