import { Component, inject, OnInit, signal } from '@angular/core';
import { ProductService } from '../../shared/services/product.service';
import { ProductResponse } from '../../shared/models/productModel';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardModule } from 'primeng/card';
import { ProductSidebarComponent } from './product-sidebar/product-sidebar.component';
import { ProgressBarModule } from 'primeng/progressbar';
import { DataViewLazyLoadEvent, DataViewModule } from 'primeng/dataview';
import { SkeletonModule } from 'primeng/skeleton';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    DataViewModule,
    SkeletonModule,
    ProductSidebarComponent,
    ProgressBarModule,
    DrawerModule,
    ButtonModule,
  ],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
})
export class ProductComponent implements OnInit {
  private productService = inject(ProductService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  pageSize!: number;
  page!: number;
  category!: string;

  products = signal<ProductResponse[]>([]);
  totalProducts = signal<number>(0);
  isLoading = signal<boolean>(true);
  errorMsg: string | null = null;

  isSidebarOpen = false;

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe({
      next: (data) => {
        this.page = data['page'] ?? 1;
        this.pageSize = data['pageSize'] ?? 10;
        this.category = data['category'] ?? 'All';
        this.getProducts();
        this.cdr.detectChanges();
      },
    });
  }

  loadProducts(event: DataViewLazyLoadEvent) {
    this.page = (event.first ?? 0) / (event.rows ?? 10) + 1;
    this.pageSize = event.rows ?? 10;

    this.router.navigate([], {
      queryParams: {
        page: this.page,
        pageSize: this.pageSize,
        category: this.category,
      },
      queryParamsHandling: 'merge',
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    this.getProducts();
  }

  getProducts() {
    this.isLoading.set(true);
    this.productService.getProducts(this.page, this.pageSize, this.category).subscribe({
      next: (data: any) => {
        const productsWithImages = data.products.map((p: any) => ({
          ...p,
          imageSrc: p.thumbNailPhoto
            ? 'data:image/gif;base64,' + this.productService.hexToBase64(p.thumbNailPhoto)
            : null,
        }));

        this.totalProducts.set(data.totalProducts);
        this.products.set(productsWithImages);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMsg = err.error?.detail || 'Si è verificato un errore';
      },
    });
  }
}
