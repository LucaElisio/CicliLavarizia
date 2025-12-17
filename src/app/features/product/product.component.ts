import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { ProductResponse } from '../../shared/models/productModel';
import { ProductService } from '../../shared/services/product.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CardModule, CommonModule],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
})
export class ProductComponent implements OnInit {

  allProducts: ProductResponse[] = [];
  currentProduct: ProductResponse | null = null;

  productCategory: string = 'All';
  currentPage: number = 1;
  pageSize: number = 12;
  hasNextPage: boolean = false;

  loading: boolean = true; // stato di caricamento

  constructor(private http: HttpClient, private productService: ProductService, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
  this.getProducts();

}
  getProducts(): void {
    this.loading = true;
    this.productService.getProducts(this.currentPage, this.pageSize, this.productCategory).subscribe({
      next: (data) => {
        this.allProducts = data;
        this.hasNextPage = data.length === this.pageSize;
        this.loading = false;
        console.log('Prodotti caricati:', this.allProducts);

        // Rilevamento manuale dei cambiamenti
        this.cd.detectChanges();

      },
      error: (err) => {
        console.error('Errore nella chiamata API:', err);
        this.loading = false;
      }
    });
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.currentPage++;
      this.getProducts();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getProducts();
    }
  }

  changeCategory(category: string): void {
    this.productCategory = category;
    this.currentPage = 1;
    this.getProducts();
  }

  productInfo(product: ProductResponse): void {
    this.currentProduct = product;
  }


}
