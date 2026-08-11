import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ClientesApiService } from './clientes-api.service';

describe('ClientesApiService', () => {
  let service: ClientesApiService; let http: HttpTestingController;
  beforeEach(() => { TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [ClientesApiService] }); service=TestBed.inject(ClientesApiService); http=TestBed.inject(HttpTestingController); });
  afterEach(() => http.verify());

  it('adapta la lista canónica y conserva los filtros de alcance', () => {
    let result: any;
    service.listar({ search:'Ana', branchId:'b1', distributorId:'d1', status:'PENDING', hasBalance:true }).subscribe(value => result=value);
    const request=http.expectOne('/api/v1/clients?search=Ana&branch_id=b1&distributor_id=d1&portfolio_status=PENDING&has_portfolio_balance=true&page=1&per_page=10');
    request.flush({ data:[{id:'c1',client_number:'CLI-1',full_name:'Ana',curp_masked:'AAAA******',distributor:{id:'d1'},branch:{id:'b1'},portfolio_summary:{current_balance:'100.0000',informational_status:'PENDING'},created_at:'2026-08-11T00:00:00Z'}],meta:{total:1} });
    expect(result.total).toBe(1); expect(result.data[0].id).toBe('c1'); expect(result.data[0].resumenCartera.saldoActual).toBe('100.0000');
  });

  it('envía alta canónica con idempotencia', () => {
    const payload:any={first_name:'Ana'}; service.crear(payload,'idem-1').subscribe();
    const request=http.expectOne('/api/v1/clients'); expect(request.request.method).toBe('POST'); expect(request.request.headers.get('Idempotency-Key')).toBe('idem-1'); expect(request.request.body).toBe(payload);
    request.flush({data:{id:'c1'}});
  });
});
