import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../shared/services/product.service';
import { ProductResponse } from '../../../shared/models/productModel';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-product-info',
  imports: [CardModule],
  templateUrl: './product-info.component.html',
  styleUrl: './product-info.component.css',
})
export class ProductInfoComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private productService = inject(ProductService);

  productId!: number;
  product = signal<ProductResponse | null>(null);

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe({
      next: (data) => {
        this.productId = Number(data['productId']);
      },
    });
    this.getProduct();
  }

  getProduct() {
    this.productService.getProductById(this.productId).subscribe({
      next: (data) => {
        this.product.set(data);
      },
    });
  }
}
