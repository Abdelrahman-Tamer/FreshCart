import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { of } from 'rxjs';

import { CheckoutComponent } from './checkout.component';
import { ProfileService, UserAddress } from '../../services/profile/profile.service';
import { CartService } from '../../../shared/services/Cart/cart.service';
import { PaymentService } from '../../../shared/services/Payment/payment.service';
import { AuthService } from '../../../shared/services/authentication/auth.service';

describe('CheckoutComponent', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;
  let profileService: ProfileService;
  let cartService: CartService;
  let paymentService: PaymentService;
  let authService: AuthService;

  const mockAddresses: UserAddress[] = [
    {
      _id: 'addr_1',
      name: 'Home',
      details: '123 Main Street, Apt 4B',
      phone: '01012345678',
      city: 'Cairo'
    },
    {
      _id: 'addr_2',
      name: 'Office',
      details: '456 Business Tower, 5th Floor',
      phone: '01198765432',
      city: 'Giza'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideToastr()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
    profileService = TestBed.inject(ProfileService);
    cartService = TestBed.inject(CartService);
    paymentService = TestBed.inject(PaymentService);
    authService = TestBed.inject(AuthService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load saved addresses and auto-select first one if authenticated', () => {
    spyOn(authService, 'isAuthenticated').and.returnValue(true);
    spyOn(profileService, 'getUserAddresses').and.returnValue(of({ status: 'success', results: 2, data: mockAddresses }));

    component.loadSavedAddresses();

    expect(component.savedAddresses.length).toBe(2);
    expect(component.selectedAddressId).toBe('addr_1');
    expect(component.checkoutForm.value.details).toBe('123 Main Street, Apt 4B');
    expect(component.checkoutForm.value.city).toBe('Cairo');
    expect(component.checkoutForm.value.phone).toBe('01012345678');
  });

  it('should switch form values when user selects a different saved address', () => {
    component.savedAddresses = mockAddresses;
    component.selectSavedAddress(mockAddresses[1]);

    expect(component.selectedAddressId).toBe('addr_2');
    expect(component.checkoutForm.value.details).toBe('456 Business Tower, 5th Floor');
    expect(component.checkoutForm.value.city).toBe('Giza');
    expect(component.checkoutForm.value.phone).toBe('01198765432');
  });

  it('should clear form values when user chooses to enter a new address', () => {
    component.selectSavedAddress(mockAddresses[0]);
    expect(component.checkoutForm.value.city).toBe('Cairo');

    component.selectNewAddressOption();

    expect(component.selectedAddressId).toBe('new');
    expect(component.checkoutForm.value.details).toBe('');
    expect(component.checkoutForm.value.city).toBe('');
    expect(component.checkoutForm.value.phone).toBe('');
  });
});
