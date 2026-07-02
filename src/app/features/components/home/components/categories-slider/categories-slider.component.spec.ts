import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { CategoriesSliderComponent } from './categories-slider.component';

describe('CategoriesSliderComponent', () => {
  let component: CategoriesSliderComponent;
  let fixture: ComponentFixture<CategoriesSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesSliderComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoriesSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
