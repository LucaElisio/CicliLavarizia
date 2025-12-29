import { Component, inject, OnInit, signal } from '@angular/core';
import { ProductService } from '../../shared/services/product.service';
import { ProductCategoryResponse, ProductResponse } from '../../shared/models/productModel';

import { CarouselModule } from 'primeng/carousel';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-home',
  imports: [CarouselModule, CardModule, ButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  productService = inject(ProductService);
  authService = inject(AuthService);

  randomProducts = signal<ProductResponse[]>([]);

  productResponsiveOptions = [
    { breakpoint: '1024px', numVisible: 3, numScroll: 3 },
    { breakpoint: '768px', numVisible: 2, numScroll: 2 },
    { breakpoint: '560px', numVisible: 1, numScroll: 1 },
  ];

  categoryResponsiveOptions = [
    { breakpoint: '1024px', numVisible: 5, numScroll: 2 },
    { breakpoint: '768px', numVisible: 3, numScroll: 1 },
    { breakpoint: '560px', numVisible: 2, numScroll: 1 },
  ];

  ngOnInit(): void {
    this.productService.getRandomProducts().subscribe({
      next: (data) => {
        this.randomProducts.set(data);
      },
    });

    this.productService.getCategories().subscribe({
      next: (data) => {
        this.productService.categories.set(data);
      },
    });
  }
}
