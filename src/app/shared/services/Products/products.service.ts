import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private readonly _HttpClient = inject(HttpClient);
  // DRY
  getAllProducts():Observable<any>{
    return this._HttpClient.get(`${environment.baseURL}/api/v1/products`)
  }


  getSpecificProduct(p_id:string):Observable<any>{
    return this._HttpClient.get(`${environment.baseURL}/api/v1/products/${p_id}`)
  }
  
}
