import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DistribuidorasApiService } from './distribuidoras-api.service';

describe('DistribuidorasApiService', () => {
  let service:DistribuidorasApiService; let http:HttpTestingController;
  beforeEach(()=>{TestBed.configureTestingModule({imports:[HttpClientTestingModule],providers:[DistribuidorasApiService]});service=TestBed.inject(DistribuidorasApiService);http=TestBed.inject(HttpTestingController);});
  afterEach(()=>http.verify());

  it('activa desde la solicitud autorizada con una versión publicada de categoría',()=>{
    service.activarSolicitud('app-1','version-1').subscribe();
    const request=http.expectOne('/api/v1/distributor-applications/app-1/activation');
    expect(request.request.method).toBe('POST'); expect(request.request.body).toEqual({category_version_id:'version-1'});
    expect(request.request.headers.get('Idempotency-Key')).toMatch(/^[0-9a-f-]{36}$/i);
    request.flush({data:{id:'d1',distributor_number:'D-1',full_name:'Persona',status:'ACTIVE',activation_status:'INVITED',branch:{id:'b1',name:'Matriz'},coordinator:null,category:null,initial_credit:{total_authorized:'1000.0000',used_balance:'0.0000',available_balance:'1000.0000'},initial_restriction:{status:'ACTIVE'},created_at:'2026-08-11',activated_at:'2026-08-11',lock_version:1}});
  });

  it('incluye lock_version en el cuerpo al cambiar categoría',()=>{
    service.asignarCategoria('d1',3,{category_version_id:'v2',starts_at:'2026-08-12',reason:'Cambio autorizado'}).subscribe();
    const request=http.expectOne('/api/v1/distributors/d1/category-assignments');
    expect(request.request.body).toEqual({category_version_id:'v2',starts_at:'2026-08-12',reason:'Cambio autorizado',lock_version:3});
    request.flush({data:{id:'a1',name:'Oro',description:'',profit_percentage:'0.1',starts_at:'2026-08-12',ends_at:null,assigned_by_id:'u1',reason:'Cambio autorizado',status:'ACTIVE'}});
  });
});
