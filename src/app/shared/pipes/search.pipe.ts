import { Pipe, PipeTransform } from '@angular/core';
import { IProduct } from '../../core/interfaces/iproduct.interface';

@Pipe({
  name: 'search',
  standalone: true
})
export class SearchPipe implements PipeTransform {

  transform(products: IProduct[], searchTerm: string): IProduct[] {
    if (!products || !searchTerm) {
      return products;
    }

    searchTerm = searchTerm.toLowerCase().trim();
    
    return products.filter(product => 
      product.title.toLowerCase().includes(searchTerm) ||
      product.category.name.toLowerCase().includes(searchTerm)
    );
  }
}
