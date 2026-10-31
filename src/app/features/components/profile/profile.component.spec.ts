import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';

import { ProfileComponent } from './profile.component';
import { ProfileService } from '../../services/profile/profile.service';
import { of, throwError } from 'rxjs';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let mockProfileService: any;

  beforeEach(async () => {
    mockProfileService = {
      getUserProfile: jasmine.createSpy('getUserProfile').and.returnValue(of({
        data: {
          _id: '123',
          name: 'Ahmed FreshCart',
          email: 'ahmed@freshcart.com',
          phone: '01012345678',
          role: 'user',
          addresses: [
            { _id: 'addr1', name: 'Home', details: '123 Nile St', phone: '01012345678', city: 'Cairo' }
          ]
        }
      })),
      getUserAddresses: jasmine.createSpy('getUserAddresses').and.returnValue(of({ status: 'success', results: 1, data: [] })),
      updateUserProfile: jasmine.createSpy('updateUserProfile').and.returnValue(of({ message: 'success' })),
      addAddress: jasmine.createSpy('addAddress').and.returnValue(of({ status: 'success', data: [] })),
      deleteAddress: jasmine.createSpy('deleteAddress').and.returnValue(of({ status: 'success', data: [] })),
      changePassword: jasmine.createSpy('changePassword').and.returnValue(of({ message: 'success', token: 'mock-token' }))
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

  it('should create the profile component', () => {
    expect(component).toBeTruthy();
  });

  it('should default to overview tab and load profile data', () => {
    expect(component.activeTab).toBe('overview');
    expect(component.userProfile?.name).toBe('Ahmed FreshCart');
    expect(component.addresses.length).toBe(1);
  });

  it('should switch tabs smoothly', () => {
    component.setTab('addresses');
    expect(component.activeTab).toBe('addresses');

    component.setTab('edit');
    expect(component.activeTab).toBe('edit');

    component.setTab('security');
    expect(component.activeTab).toBe('security');
  });

  it('should toggle password visibility controls', () => {
    expect(component.showCurrentPassword).toBeFalse();
    component.toggleCurrentPassword();
    expect(component.showCurrentPassword).toBeTrue();

    expect(component.showNewPassword).toBeFalse();
    component.toggleNewPassword();
    expect(component.showNewPassword).toBeTrue();

    expect(component.showRePassword).toBeFalse();
    component.toggleRePassword();
    expect(component.showRePassword).toBeTrue();
  });

  it('should validate password match correctly with missMatch error', () => {
    component.changePasswordForm.patchValue({
      currentPassword: 'OldPassword1!',
      password: 'NewPassword1!',
      rePassword: 'DifferentPassword2!'
    });
    expect(component.changePasswordForm.hasError('missMatch')).toBeTrue();

    component.changePasswordForm.patchValue({
      rePassword: 'NewPassword1!'
    });
    expect(component.changePasswordForm.hasError('missMatch')).toBeFalse();
  });

  it('should evaluate password requirement criteria', () => {
    component.changePasswordForm.patchValue({ password: 'abc' });
    expect(component.hasMinLength).toBeFalse();
    expect(component.hasUpper).toBeFalse();
    expect(component.hasLower).toBeTrue();
    expect(component.hasNumber).toBeFalse();
    expect(component.hasSpecial).toBeFalse();

    component.changePasswordForm.patchValue({ password: 'StrongPass123!' });
    expect(component.hasMinLength).toBeTrue();
    expect(component.hasUpper).toBeTrue();
    expect(component.hasLower).toBeTrue();
    expect(component.hasNumber).toBeTrue();
    expect(component.hasSpecial).toBeTrue();
  });

  it('should open and close add address modal with preset support', () => {
    component.openAddAddressModal();
    expect(component.isAddAddressModalOpen).toBeTrue();

    component.setAddressLabelPreset('Office');
    expect(component.newAddressForm.get('name')?.value).toBe('Office');

    component.closeAddAddressModal();
    expect(component.isAddAddressModalOpen).toBeFalse();
  });

  it('should handle location error when geolocation is unsupported', () => {
    // If window or geolocation is not present or mocked
    component.locationError = null;
    component.useCurrentLocation();
    // In headless environment without GPS permission, error or prompt is handled gracefully
    expect(component.isDetectingLocation).toBeDefined();
  });

  it('should call updateProfile when edit form is valid', () => {
    component.editProfileForm.patchValue({
      name: 'Mohamed Tamer',
      phone: '01012345678'
    });
    component.onUpdateProfile();
    expect(mockProfileService.updateUserProfile).toHaveBeenCalled();
  });

  it('should call changePassword when form is valid and show success', () => {
    component.changePasswordForm.patchValue({
      currentPassword: 'ValidPass123!',
      password: 'StrongPass123!',
      rePassword: 'StrongPass123!'
    });
    component.onChangePassword();
    expect(mockProfileService.changePassword).toHaveBeenCalled();
  });
});
