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
import { ProductModelsResponse } from '../../shared/models/productModelsResponse';


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

  originalModels = signal<ProductModelsResponse[]>([]);
  allProductModels = signal<ProductModelsResponse[]>([]);
  currentModel: ProductModelsResponse | null = null;
  selectedModel: ProductModelsResponse | null = null;
  filteredProducts = signal<ProductResponse[]>([]);

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
  this.getModels();
  this.getAllCategories();
}
  getProducts(): void {
    this.loading = true;
    // Se c'è un filtro prezzo attivo (diverso dal range completo), carica più prodotti
    const hasActivePriceFilter = this.minPrice > 0 || this.maxPrice < 9000;
    const effectivePageSize = hasActivePriceFilter ? this.pageSize * 3 : this.pageSize;
    
    this.productService.getProducts(this.currentPage, effectivePageSize, this.productCategory).subscribe({
      next: (data: any) => {
        this.originalProducts.set(data.products); // Salva i prodotti originali
        this.filterByPrice(); // Applica il filtro prezzo lato client
        this.hasNextPage = data.length === effectivePageSize;
        this.loading = false;
        console.log('Prodotti caricati:', this.allProducts());

      },
      error: (err) => {
        console.error('Errore nella chiamata API:', err);
        this.loading = false;
      }
    });
  }

  getModels(): void {
    this.loading = true;
    this.productService.getProductModels(this.currentPage, this.pageSize, this.productCategory).subscribe({
      next: (data) => {
        this.originalModels.set(data);
        this.allProductModels.set(data);
        this.hasNextPage = data.length === this.pageSize;
        this.loading = false;
        console.log('Modelli caricati:', this.allProductModels());
      },
      error: (err) => {
        console.error('Errore nella chiamata API per le descrizioni:', err);
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
    this.getModels();
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
    // Limita i risultati al pageSize richiesto
    const limitedProducts = filteredProducts.slice(0, this.pageSize);
    this.allProducts.set(limitedProducts);
  }

  selectModel(model: ProductModelsResponse): void {
    this.selectedModel = model;
    // Filtra i prodotti per il modello selezionato
    const productsForModel = this.allProducts().filter(p => p.productModelId === model.productModelId);
    this.filteredProducts.set(productsForModel);
    console.log('Modello selezionato:', model);
    console.log('Prodotti filtrati:', productsForModel);
  }

  backToModels(): void {
    this.selectedModel = null;
    this.filteredProducts.set([]);
  }

  onPageSizeChange(): void {
    // Se siamo nella vista modelli, ricarica i modelli
    if (!this.selectedModel) {
      this.getModels();
    }
    // Ricarica sempre i prodotti per avere dati freschi quando si clicca su un modello
    this.getProducts();
  }

}
