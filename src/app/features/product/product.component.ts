import { Component, inject, OnInit, signal } from '@angular/core';
import { ProductService } from '../../shared/services/product.service';
import { ProductResponse } from '../../shared/models/productModel';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product',
  imports: [],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
})
export class ProductComponent implements OnInit {
  private productService = inject(ProductService);
  private activatedRoute = inject(ActivatedRoute);

  pageSize!: number;
  page!: number;
  category!: string;

  products = signal<ProductResponse[]>([]);
  isLoading = signal<boolean>(true);
  errorMsg: string | null = null;

  ngOnInit(): void {
    this.activatedRoute.params.subscribe({
      next: (data) => {
        this.page = data['page'] ?? 1;
        this.pageSize = data['pageSize'] ?? 10;
        this.category = data['category'] ?? 'All';
      },
    });
    this.getProducts();
  }

  getProducts() {
    this.isLoading.set(true);
    this.productService.getProducts(this.page, this.pageSize, this.category).subscribe({
      next: (data) => {
        this.products.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMsg = err.error.detail;
      },
    });
  }
}
