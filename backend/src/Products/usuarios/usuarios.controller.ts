import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

const uploadOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = join(process.cwd(), 'uploads', 'usuarios');
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const fileExt = extname(file.originalname);
      const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
      cb(null, name);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Solo se permiten archivos de imagen'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB máximo para imágenes
};

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // Público: registro de nuevos usuarios
  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuariosService.update(+id, updateUsuarioDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/foto')
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  uploadFoto(@Param('id') id: string, @UploadedFile() file: any) {
    const path = file ? `uploads/usuarios/${file.filename}` : undefined;
    return this.usuariosService.updateFiles(+id, { fotoPerfil: path });
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/firma')
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  uploadFirma(@Param('id') id: string, @UploadedFile() file: any) {
    const path = file ? `uploads/usuarios/${file.filename}` : undefined;
    return this.usuariosService.updateFiles(+id, { firma: path });
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(+id);
  }
}
