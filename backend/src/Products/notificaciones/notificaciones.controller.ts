import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';

@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Post()
  create(@Body() body: { titulo: string; descripcion: string; tipo: string; usuario_destino_id: number; usuario_origen_id?: number }) {
    return this.notificacionesService.createNotification(body);
  }

  @Get('usuario/:userId')
  findByUsuario(@Param('userId') userId: string) {
    return this.notificacionesService.findByUsuario(+userId);
  }

  @Patch(':id/marcar-leida')
  marcarLeida(@Param('id') id: string) {
    return this.notificacionesService.marcarLeida(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificacionesService.remove(+id);
  }
}
