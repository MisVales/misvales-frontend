import {
  CategoriaReq,
  CategoriaRes,
  ProductoReq,
  ProductoRes,
} from '../api/models/catalogos.dtos';
import { Categoria, Producto } from '../models/catalogos.models';

export class CatalogosMapper {
  static mapCategoriaResToModel(dto: CategoriaRes): Categoria {
    return {
      id: dto.id,
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      porcentajeGanancia: dto.porcentajeGanancia,
      estado: dto.estado,
      inicioVigencia: new Date(dto.inicioVigencia),
      motivo: dto.motivo,
      version: dto.version,
      lockVersion: dto.lockVersion,
    };
  }

  static mapCategoriaModelToReq(model: Partial<Categoria>): CategoriaReq {
    return {
      nombre: model.nombre || '',
      descripcion: model.descripcion || '',
      porcentajeGanancia: model.porcentajeGanancia || '0',
      inicioVigencia: model.inicioVigencia ? model.inicioVigencia.toISOString() : new Date().toISOString(),
      motivo: model.motivo || '',
    };
  }

  static mapProductoResToModel(dto: ProductoRes): Producto {
    return {
      id: dto.id,
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      montoNominal: dto.montoNominal,
      comisionPrestamo: dto.comisionPrestamo,
      interesQuincenal: dto.interesQuincenal,
      seguro: dto.seguro,
      numeroQuincenas: dto.numeroQuincenas,
      estado: dto.estado,
      inicioVigencia: new Date(dto.inicioVigencia),
      motivo: dto.motivo,
      version: dto.version,
      lockVersion: dto.lockVersion,
    };
  }

  static mapProductoModelToReq(model: Partial<Producto>): ProductoReq {
    return {
      nombre: model.nombre || '',
      descripcion: model.descripcion || '',
      montoNominal: model.montoNominal || '0',
      comisionPrestamo: model.comisionPrestamo || '0',
      interesQuincenal: model.interesQuincenal || '0',
      seguro: model.seguro || '0',
      numeroQuincenas: model.numeroQuincenas || 0,
      inicioVigencia: model.inicioVigencia ? model.inicioVigencia.toISOString() : new Date().toISOString(),
      motivo: model.motivo || '',
    };
  }
}
