import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { InternshipsService, InternshipStatus, StudyLevel, InternshipInformation, Internship } from './internships.service';
import { environment } from '../../../environments/environment';

describe('InternshipsService', () => {
  let service: InternshipsService;
  let httpMock: HttpTestingController;
  
  const API_BASE_URL = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [InternshipsService]
    });
    
    service = TestBed.inject(InternshipsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getInternships', () => {
    it('should retrieve internships list', () => {
      const mockResponse = {
        internships: [
          {
            id: '1',
            startDate: '2024-01-01',
            endDate: '2024-06-30',
            status: InternshipStatus.Accepted,
            studyLevel: StudyLevel.Undergraduate,
            createdOn: '2023-12-01',
            internshipProvider: {
              id: 'provider-1',
              name: 'Test Company',
              address: '123 Test St',
              contactEmailAddress: 'contact@test.com',
              contactPhoneNumber: '+1234567890'
            }
          },
          {
            id: '2',
            startDate: '2024-07-01',
            endDate: '2024-12-31',
            status: InternshipStatus.Pending,
            studyLevel: StudyLevel.Graduate,
            createdOn: '2024-06-01'
          }
        ]
      };

      service.getInternships().subscribe(result => {
        expect(result).toEqual(mockResponse);
        expect(result.internships.length).toBe(2);
        expect(result.internships[0].status).toBe(InternshipStatus.Accepted);
        expect(result.internships[1].status).toBe(InternshipStatus.Pending);
      });

      const req = httpMock.expectOne(`${API_BASE_URL}/students/internships`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle empty internships list', () => {
      const mockResponse = { internships: [] };

      service.getInternships().subscribe(result => {
        expect(result.internships).toEqual([]);
        expect(result.internships.length).toBe(0);
      });

      const req = httpMock.expectOne(`${API_BASE_URL}/students/internships`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle HTTP error', () => {
      const errorMessage = 'Failed to load internships';

      service.getInternships().subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Internal Server Error');
        }
      });

      const req = httpMock.expectOne(`${API_BASE_URL}/students/internships`);
      req.flush(errorMessage, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getInternshipById', () => {
    it('should retrieve specific internship by ID', () => {
      const internshipId = 'test-id-123';
      const mockResponse = {
        data: {
          id: internshipId,
          startDate: '2024-01-01',
          endDate: '2024-06-30',
          status: InternshipStatus.Accepted,
          studyLevel: StudyLevel.Undergraduate,
          internshipProvider: {
            id: 'provider-1',
            name: 'Test Company',
            address: '123 Test St',
            contactEmailAddress: 'contact@test.com',
            contactPhoneNumber: '+1234567890'
          },
          studentId: 'student-123',
          mentorId: 'mentor-456'
        }
      };

      service.getInternshipById(internshipId).subscribe(result => {
        expect(result).toEqual(mockResponse);
        expect(result.data.id).toBe(internshipId);
        expect(result.data.status).toBe(InternshipStatus.Accepted);
        expect(result.data.internshipProvider?.name).toBe('Test Company');
      });

      const req = httpMock.expectOne(`${API_BASE_URL}/students/internships/${internshipId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle internship not found', () => {
      const internshipId = 'non-existent-id';

      service.getInternshipById(internshipId).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        }
      });

      const req = httpMock.expectOne(`${API_BASE_URL}/students/internships/${internshipId}`);
      req.flush('Internship not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle empty or invalid ID', () => {
      const invalidId = '';

      service.getInternshipById(invalidId).subscribe();

      const req = httpMock.expectOne(`${API_BASE_URL}/students/internships/${invalidId}`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: null });
    });
  });

  describe('markInternshipCompleted', () => {
    it('should mark internship as completed successfully', () => {
      const internshipId = 'test-id-123';
      const mockResponse = { success: true };

      service.markInternshipCompleted(internshipId).subscribe(result => {
        expect(result).toEqual(mockResponse);
        expect(result.success).toBe(true);
      });

      const req = httpMock.expectOne(`${API_BASE_URL}/students/internships/${internshipId}/complete`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({});
      req.flush(mockResponse);
    });

    it('should handle completion failure', () => {
      const internshipId = 'test-id-123';
      const mockResponse = { success: false };

      service.markInternshipCompleted(internshipId).subscribe(result => {
        expect(result.success).toBe(false);
      });

      const req = httpMock.expectOne(`${API_BASE_URL}/students/internships/${internshipId}/complete`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockResponse);
    });

    it('should handle HTTP error on completion', () => {
      const internshipId = 'test-id-123';

      service.markInternshipCompleted(internshipId).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.statusText).toBe('Bad Request');
        }
      });

      const req = httpMock.expectOne(`${API_BASE_URL}/students/internships/${internshipId}/complete`);
      req.flush('Cannot complete internship', { status: 400, statusText: 'Bad Request' });
    });

    it('should send empty request body', () => {
      const internshipId = 'test-id-123';

      service.markInternshipCompleted(internshipId).subscribe();

      const req = httpMock.expectOne(`${API_BASE_URL}/students/internships/${internshipId}/complete`);
      expect(req.request.body).toEqual({});
      req.flush({ success: true });
    });
  });

  describe('InternshipStatus enum', () => {
    it('should have correct status values', () => {
      expect(InternshipStatus.Pending).toBe(1);
      expect(InternshipStatus.Accepted).toBe(2);
      expect(InternshipStatus.Rejected).toBe(3);
      expect(InternshipStatus.Completed).toBe(4);
    });
  });

  describe('StudyLevel enum', () => {
    it('should have correct study level values', () => {
      expect(StudyLevel.Undergraduate).toBe(1);
      expect(StudyLevel.Graduate).toBe(2);
    });
  });

  describe('API URL configuration', () => {
    it('should use correct base URL from environment', () => {
      service.getInternships().subscribe();
      
      const req = httpMock.expectOne(`${environment.apiUrl}/students/internships`);
      expect(req.request.url).toContain(environment.apiUrl);
      req.flush({ internships: [] });
    });
  });

  describe('Error handling', () => {
    it('should propagate network errors', () => {
      service.getInternships().subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.name).toBe('HttpErrorResponse');
        }
      });

      const req = httpMock.expectOne(`${API_BASE_URL}/students/internships`);
      req.error(new ErrorEvent('Network error'));
    });

    it('should handle timeout errors', () => {
      service.getInternships().subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(0);
        }
      });

      const req = httpMock.expectOne(`${API_BASE_URL}/students/internships`);
      req.error(new ErrorEvent('Timeout'), { status: 0 });
    });
  });
}); 