import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DocumentService, DocumentDto, DocumentWithContentDto, CreateDocumentRequest, ApiResponse } from './document.service';
import { environment } from '../../../environments/environment';

xdescribe('DocumentService', () => {
  let service: DocumentService;
  let httpMock: HttpTestingController;
  
  const API_BASE_URL = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DocumentService]
    });
    
    service = TestBed.inject(DocumentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getDocuments', () => {
    it('should retrieve documents list', () => {
      const mockResponse: ApiResponse<DocumentDto[]> = {
        result: [
          {
            id: '1',
            fileName: 'Document 1.pdf',
            fileSize: 1024,
            uploadedAt: '2024-01-01T00:00:00.000Z',
            uploadedByName: 'user1',
            mimeType: 'application/pdf'
          },
          {
            id: '2',
            fileName: 'Document 2.docx',
            fileSize: 2048,
            uploadedAt: '2024-01-02T00:00:00.000Z',
            uploadedByName: 'user2',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          }
        ],
        errors: [],
        hasErrors: false
      };

      service.getDocuments().subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.result.length).toBe(2);
        expect(response.result[0].fileName).toBe('Document 1.pdf');
        expect(response.hasErrors).toBe(false);
      });

      const req = httpMock.expectOne(`${API_BASE_URL}/documents`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle empty documents list', () => {
      const emptyResponse: ApiResponse<DocumentDto[]> = {
        result: [],
        errors: [],
        hasErrors: false
      };

      service.getDocuments().subscribe(response => {
        expect(response.result).toEqual([]);
        expect(response.result.length).toBe(0);
        expect(response.hasErrors).toBe(false);
      });

      const req = httpMock.expectOne(`${API_BASE_URL}/documents`);
      req.flush(emptyResponse);
    });

    it('should handle HTTP error', () => {
      service.getDocuments().subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Internal Server Error');
        }
      });

      const req = httpMock.expectOne(`${API_BASE_URL}/documents`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getDocument', () => {
    it('should retrieve specific document by ID', () => {
      const documentId = 'doc-123';
      const mockResponse: ApiResponse<DocumentWithContentDto> = {
        result: {
          id: documentId,
          fileName: 'Test Document.pdf',
          fileSize: 1024,
          uploadedAt: '2024-01-01T00:00:00.000Z',
          uploadedByName: 'user1',
          contentBase64: 'base64-encoded-content',
          mimeType: 'application/pdf'
        },
        errors: [],
        hasErrors: false
      };

      service.getDocument(documentId).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.result.id).toBe(documentId);
        expect(response.result.contentBase64).toBe('base64-encoded-content');
        expect(response.hasErrors).toBe(false);
      });

      const req = httpMock.expectOne(`${API_BASE_URL}/documents/${documentId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle document not found', () => {
      const documentId = 'non-existent';

      service.getDocument(documentId).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        }
      });

      const req = httpMock.expectOne(`${API_BASE_URL}/documents/${documentId}`);
      req.flush('Document not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createDocument', () => {
    it('should upload new document successfully', () => {
      const createRequest: CreateDocumentRequest = {
        fileName: 'test.pdf',
        contentBase64: 'dGVzdCBjb250ZW50', // base64 of "test content"
        mimeType: 'application/pdf'
      };
      const mockResponse = {
        result: { id: 'new-doc-id' },
        errors: [],
        hasErrors: false
      };

      service.createDocument(createRequest).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.result.id).toBe('new-doc-id');
        expect(response.hasErrors).toBe(false);
      });

      const req = httpMock.expectOne(`${API_BASE_URL}/documents`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      
      req.flush(mockResponse);
    });

    it('should handle upload errors', () => {
      const createRequest: CreateDocumentRequest = {
        fileName: 'test.pdf',
        contentBase64: 'dGVzdCBjb250ZW50',
        mimeType: 'application/pdf'
      };
      const mockErrorResponse = {
        result: null,
        errors: [{ message: 'File too large' }],
        hasErrors: true
      };

      service.createDocument(createRequest).subscribe(response => {
        expect(response.hasErrors).toBe(true);
        expect(response.errors.length).toBe(1);
        expect(response.errors[0].message).toBe('File too large');
      });

      const req = httpMock.expectOne(`${API_BASE_URL}/documents`);
      req.flush(mockErrorResponse);
    });

    it('should handle file upload with different mime types', () => {
      const createRequest: CreateDocumentRequest = {
        fileName: 'test.docx',
        contentBase64: 'ZG9jIGNvbnRlbnQ=', // base64 of "doc content"
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      };
      
      const mockResponse = {
        result: { id: 'doc-file-id' },
        errors: [],
        hasErrors: false
      };

      service.createDocument(createRequest).subscribe(response => {
        expect(response.result.id).toBe('doc-file-id');
      });

      const req = httpMock.expectOne(`${API_BASE_URL}/documents`);
      expect(req.request.body).toEqual(createRequest);
      
      req.flush(mockResponse);
    });
  });

  describe('deleteDocument', () => {
    it('should delete document successfully', () => {
      const documentId = 'doc-to-delete';
      const mockResponse = {
        result: undefined,
        errors: [],
        hasErrors: false
      };

      service.deleteDocument(documentId).subscribe(response => {
        expect(response.hasErrors).toBe(false);
      });

      const req = httpMock.expectOne(`${API_BASE_URL}/documents/${documentId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });

    it('should handle delete errors', () => {
      const documentId = 'protected-doc';
      const mockErrorResponse = {
        result: null,
        errors: [{ message: 'Cannot delete protected document' }],
        hasErrors: true
      };

      service.deleteDocument(documentId).subscribe(response => {
        expect(response.hasErrors).toBe(true);
        expect(response.errors[0].message).toBe('Cannot delete protected document');
      });

      const req = httpMock.expectOne(`${API_BASE_URL}/documents/${documentId}`);
      req.flush(mockErrorResponse);
    });

    it('should handle document not found for deletion', () => {
      const documentId = 'non-existent';

      service.deleteDocument(documentId).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${API_BASE_URL}/documents/${documentId}`);
      req.flush('Document not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('API URL configuration', () => {
    it('should use correct base URL from environment', () => {
      service.getDocuments().subscribe();
      
      const req = httpMock.expectOne(`${environment.apiUrl}/documents`);
      expect(req.request.url).toContain(environment.apiUrl);
      req.flush([]);
    });
  });

  describe('Request handling', () => {
    it('should send proper CreateDocumentRequest', () => {
      const createRequest: CreateDocumentRequest = {
        fileName: 'test.txt',
        contentBase64: 'Y29udGVudA==', // base64 of "content"
        mimeType: 'text/plain'
      };
      
      service.createDocument(createRequest).subscribe();
      
      const req = httpMock.expectOne(`${API_BASE_URL}/documents`);
      
      expect(req.request.body).toEqual(createRequest);
      
      req.flush({ result: { id: 'test' }, errors: [], hasErrors: false });
    });
  });

  describe('Error scenarios', () => {
    it('should handle network errors', () => {
      service.getDocuments().subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.name).toBe('HttpErrorResponse');
        }
      });

      const req = httpMock.expectOne(`${API_BASE_URL}/documents`);
      req.error(new ErrorEvent('Network error'));
    });

    it('should handle timeout errors', () => {
      const createRequest: CreateDocumentRequest = {
        fileName: 'test.txt',
        contentBase64: '',
        mimeType: 'text/plain'
      };

      service.createDocument(createRequest).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(0);
        }
      });

      const req = httpMock.expectOne(`${API_BASE_URL}/documents`);
      req.error(new ErrorEvent('Timeout'), { status: 0 });
    });

    it('should handle malformed response', () => {
      service.getDocuments().subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(200);
        }
      });

      const req = httpMock.expectOne(`${API_BASE_URL}/documents`);
      req.flush('invalid json', { status: 200, statusText: 'OK' });
    });
  });

  describe('Request validation', () => {
    it('should handle empty content', () => {
      const emptyRequest: CreateDocumentRequest = {
        fileName: '',
        contentBase64: '',
        mimeType: ''
      };
      
      service.createDocument(emptyRequest).subscribe();
      
      const req = httpMock.expectOne(`${API_BASE_URL}/documents`);
      expect(req.request.body).toEqual(emptyRequest);
      
      req.flush({ result: { id: 'empty' }, errors: [], hasErrors: false });
    });

    it('should handle large content', () => {
      const largeContentBase64 = 'eA=='.repeat(2500); // Base64 for lots of 'x' characters
      const largeRequest: CreateDocumentRequest = {
        fileName: 'large.txt',
        contentBase64: largeContentBase64,
        mimeType: 'text/plain'
      };
      
      service.createDocument(largeRequest).subscribe();
      
      const req = httpMock.expectOne(`${API_BASE_URL}/documents`);
      expect(req.request.body).toEqual(largeRequest);
      
      req.flush({ result: { id: 'large' }, errors: [], hasErrors: false });
    });
  });
}); 