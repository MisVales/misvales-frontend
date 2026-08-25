import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CarteraApiService } from './cartera-api.service';

describe('CarteraApiService', () => {
  let service:CarteraApiService; let http:HttpTestingController;
  beforeEach(()=>{TestBed.configureTestingModule({imports:[HttpClientTestingModule],providers:[CarteraApiService]});service=TestBed.inject(CarteraApiService);http=TestBed.inject(HttpTestingController);});
  afterEach(()=>http.verify());

  it('envía el movimiento informativo canónico sin convertirlo en operación financiera',()=>{
    const payload:any={entry_type:'DEBT',amount:'250.0000',informational_status:'PENDING',occurred_at:'2026-08-11T10:00:00-06:00',due_date:null,last_payment_at:null,note:'Seguimiento',related_voucher_id:null};
    let result:any; service.registrarMovimiento('c1',payload,'idem-cartera').subscribe(value=>result=value);
    const request=http.expectOne('/api/v1/clients/c1/portfolio-entries'); expect(request.request.method).toBe('POST'); expect(request.request.body).toEqual(payload); expect(request.request.headers.get('Idempotency-Key')).toBe('idem-cartera');
    request.flush({data:{id:'m1',client_id:'c1',entry_type:'DEBT',amount:'250.0000',informational_status:'PENDING',occurred_at:payload.occurred_at,due_date:null,last_payment_at:null,note:'Seguimiento',related_voucher_id:null,recorded_by:'u1',lock_version:1}});
    expect(result.tipo).toBe('DEBT'); expect(result.importe).toBe('250.0000');
  });
});

