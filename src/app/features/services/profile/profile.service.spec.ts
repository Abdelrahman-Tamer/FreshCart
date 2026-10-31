import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ProfileService } from './profile.service';
import { environment } from '../../../../environments/environment';

describe('ProfileService', () => {
  let service: ProfileService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProfileService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch user profile', () => {
    const mockData = {
      data: {
        _id: '123',
        name: 'Ahmed',
        email: 'ahmed@freshcart.com',
        role: 'user'
      }
    };

    service.getUserProfile().subscribe((res) => {
      expect(res.data.name).toBe('Ahmed');
    });

    const req = httpMock.expectOne(`${environment.baseURL}/api/v1/users/getMe`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });
});
