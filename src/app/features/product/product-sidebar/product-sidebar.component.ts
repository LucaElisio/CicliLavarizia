import { Component, inject, OnInit, signal } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ProductService } from '../../../shared/services/product.service';
import { ProductCategoryResponse } from '../../../shared/models/productModel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-product-sidebar',
  imports: [CardModule, ProgressSpinnerModule, RouterLink],
  templateUrl: './product-sidebar.component.html',
  styleUrl: './product-sidebar.component.css',
})
export class ProductSidebarComponent implements OnInit {
  private productService = inject(ProductService);
  categories = signal<ProductCategoryResponse[]>([]);
  isLoading = signal<boolean>(true);
  errorMsg: string | null = null;

  ngOnInit(): void {
    this.getCategories();
  }

  getCategories() {
    this.isLoading.set(true);
    this.productService.getCategories().subscribe({
      next: (response) => {
        this.categories.set(response);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMsg = err.error.detail;
      },
    });
  }
}
