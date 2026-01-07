import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ProductService } from '../../shared/services/product.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardModule } from 'primeng/card';
import { ProductSidebarComponent } from './product-sidebar/product-sidebar.component';
import { ProgressBarModule } from 'primeng/progressbar';
import { DataViewLazyLoadEvent, DataViewModule } from 'primeng/dataview';
import { SkeletonModule } from 'primeng/skeleton';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { CartService } from '../../shared/services/cart.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    RouterLink,
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
  private cartService = inject(CartService);

  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  pageSize!: number;
  page!: number;
  category!: string;

  isLoading = signal<boolean>(true);
  errorMsg: string | null = null;
  products = computed(() => this.productService.products());
  totalProducts = computed(() => this.productService.totalProducts());

  isSidebarOpen = false;

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe({
      next: (data) => {
        this.page = data['page'] ?? 1;
        this.pageSize = data['pageSize'] ?? 10;
        this.category = data['category'] ?? 'All';
        this.getProducts();
        this.cdr.detectChanges();
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      },
    });
  }

  addToCart(productId: number, quantity: number = 1) {
    this.cartService
      .addToCart(productId, quantity)
      .pipe(switchMap(() => this.cartService.getCart()))
      .subscribe({
        next: (data) => {
          this.cartService.cartProducts.set(data);
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
      next: (data) => {
        this.productService.totalProducts.set(data.totalProducts);
        this.productService.products.set(data.products);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMsg = err.error?.detail || 'Si è verificato un errore';
      },
    });
  }
}
