import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';

import { ProfileComponent } from './profile.component';
import { ProfileService } from '../../services/profile/profile.service';
import { of } from 'rxjs';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  beforeEach(async () => {
    const mockProfileService = {
      getUserProfile: () => of({
        data: {
          _id: '123',
          name: 'Ahmed FreshCart',
          email: 'ahmed@freshcart.com',
          phone: '01012345678',
          role: 'user',
          addresses: []
        }
      }),
      getUserAddresses: () => of({ status: 'success', results: 0, data: [] }),
      updateUserProfile: () => of({ message: 'success' }),
      addAddress: () => of({ status: 'success', data: [] }),
      deleteAddress: () => of({ status: 'success', data: [] }),
      changePassword: () => of({ message: 'success', token: 'mock' })
    };

    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideToastr(),
        { provide: ProfileService, useValue: mockProfileService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to overview tab', () => {
    expect(component.activeTab).toBe('overview');
  });

  it('should switch tabs', () => {
    component.setTab('addresses');
    expect(component.activeTab).toBe('addresses');

    component.setTab('edit');
    expect(component.activeTab).toBe('edit');

    component.setTab('security');
    expect(component.activeTab).toBe('security');
  });
});
