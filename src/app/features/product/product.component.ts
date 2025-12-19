import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { ProductCategoryResponse, ProductResponse } from '../../shared/models/productModel';
import { ProductService } from '../../shared/services/product.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { SliderModule } from 'primeng/slider';
import { FormsModule } from '@angular/forms';
import { Slider } from 'primeng/slider';
import { InputTextModule } from 'primeng/inputtext';


@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CardModule, CommonModule, SliderModule, FormsModule, Slider, InputTextModule],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
})
export class ProductComponent implements OnInit {

  allProducts = signal<ProductResponse[]>([]);
  originalProducts = signal<ProductResponse[]>([]); // Prodotti originali non filtrati
  allCategories =signal<ProductCategoryResponse[]>([]);
  currentProduct: ProductResponse | null = null;

  productCategory: string = 'All';
  currentPage: number = 1;
  pageSize: number = 21;
  hasNextPage: boolean = false;

  minPrice: number = 0;
  maxPrice: number = 9000;
  priceRange: number[] = [this.minPrice, this.maxPrice];

  loading: boolean = true; // stato di caricamento

  constructor(private http: HttpClient, private productService: ProductService) { }

  ngOnInit(): void {
  this.getProducts();
  this.getAllCategories();
}
  getProducts(): void {
    this.loading = true;
    this.productService.getProducts(this.currentPage, this.pageSize, this.productCategory).subscribe({
      next: (data) => {
        this.originalProducts.set(data); // Salva i prodotti originali
        this.filterByPrice(); // Applica il filtro prezzo
        this.hasNextPage = data.length === this.pageSize;
        this.loading = false;
        console.log('Prodotti caricati:', this.allProducts);

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

  getAllCategories(): void {
    this.productService.getCategories().subscribe({
      next: (data) => {
        this.allCategories.set(data);
        console.log('Categorie caricate:', this.allCategories);
      },
      error: (err) => {
        console.error('Errore nella chiamata API per le categorie:', err);
      }
    });

  }

  filterByPrice(): void {
    const filteredProducts = this.originalProducts().filter(product => 
      product.listPrice >= this.minPrice && product.listPrice <= this.maxPrice
    );
    this.allProducts.set(filteredProducts);
  }

}
