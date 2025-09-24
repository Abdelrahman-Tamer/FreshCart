import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class CartService {


  private readonly _HttpClient = inject(HttpClient)
  private readonly _CookieService = inject(CookieService)
  
  GetLoggedUserCart():Observable<any>{
    return this._HttpClient.get(`${environment.baseURL}/api/v1/cart` )
  }

  AddProductToCart(p_id:string):Observable<any>{
    return this._HttpClient.post(`${environment.baseURL}/api/v1/cart` , {"productId": p_id}
    )
  }

  UpdateCartProductQuantity(p_id:string , count:number):Observable<any>{
    return this._HttpClient.put(`${environment.baseURL}/api/v1/cart/${p_id}` , {'count':count }
    )
  }

  RemovespecifiCartItem(p_id:string):Observable<any>{
    return this._HttpClient.delete(`${environment.baseURL}/api/v1/cart/${p_id}`)
  }

  // get|delete(URL , {OPTIONS})
  // post|put(URL , BODY ,{OPTIONS})


}
