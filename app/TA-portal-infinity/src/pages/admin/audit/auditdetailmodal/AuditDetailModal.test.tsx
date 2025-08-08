import { render, screen, fireEvent } from '@testing-library/react';
import AuditDetailModal from './AuditDetailModal';
import * as auditHook from '../../../../api/admin/audit/useAuditEvent';
import { vi } from 'vitest';
import type { UseQueryResult } from '@tanstack/react-query';
import type AuditEvent from '../../../../interfaces/admin/audit/AuditEvent';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

describe('AuditDetailModal', () => {
    const onCloseMock = vi.fn();
    const queryClient = new QueryClient();
    beforeEach(() => {
        vi.restoreAllMocks();
        onCloseMock.mockClear();
    });

    it('renders nothing when id is null', () => {
        const { container } = render(
            <QueryClientProvider client={queryClient}>
                <AuditDetailModal id={null} onClose={onCloseMock} serviceFilter="" />
            </QueryClientProvider>
        );
        expect(container.firstChild).toBeNull();
    });

    it('shows loading state', () => {
        const loadingMock = {
        data: undefined,
        isLoading: true,
        error: null,
    } as unknown as UseQueryResult<AuditEvent, Error>

        vi.spyOn(auditHook, 'useAuditEvent').mockReturnValue(loadingMock)
        render(
            <AuditDetailModal id={1} onClose={onCloseMock} serviceFilter="svc" />
        );
        expect(screen.getByText('Loading…')).toBeInTheDocument();
    });

    it('shows error message', () => {

        const errorMock = {
        data: undefined,
        isLoading: false ,
        isError: true,
        error: new Error('Test error'),
    } as unknown as UseQueryResult<AuditEvent, Error>

        vi.spyOn(auditHook, 'useAuditEvent').mockReturnValue(errorMock);
        render(
            <AuditDetailModal id={1} onClose={onCloseMock} serviceFilter="" />
        );
        expect(screen.getByText('Error: Test error')).toBeInTheDocument();
    });

    it('displays audit details and pretty‑printed JSON on success', () => {
        const mockData = {
            service: 'MyService',
            actorId: 42,
            actorName: 'John Doe',
            action: 'UPDATE',
            entityType: 'TestEntity',
            entityName: 'Test Entity Name',
            entityId: 99,
            timestamp: '2025-07-16T12:00:00Z',
            beforeJson: '{"foo":"bar"}',
            afterJson: '{"foo":"baz"}',
        };
        const mockAuditEvent = {
            data: mockData,
            isLoading: false,
            error: null,
        } as unknown as UseQueryResult<AuditEvent, Error>
        vi.spyOn(auditHook, 'useAuditEvent').mockReturnValue(mockAuditEvent);

        render(
            <QueryClientProvider client={queryClient}>
                <AuditDetailModal id={1} onClose={onCloseMock} serviceFilter="" />
            </QueryClientProvider>
        );

        expect(screen.getByText('Audit Event #1')).toBeInTheDocument();
        expect(screen.getByText('MyService')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Test Entity Name')).toBeInTheDocument();
        expect(screen.getByText('Before')).toBeInTheDocument();
        expect(screen.getByText('After')).toBeInTheDocument();
    });

    it('shows "No details available" when data is null', () => {
        const mockAuditEvent = {
            data: null,
            isLoading: false,
            error: null,
        } as unknown as UseQueryResult<AuditEvent, Error>
        vi.spyOn(auditHook, 'useAuditEvent').mockReturnValue(mockAuditEvent);

        render(
            <QueryClientProvider client={queryClient}>
                <AuditDetailModal id={1} onClose={onCloseMock} serviceFilter="" />
            </QueryClientProvider>
        );

        expect(screen.getByText('No details available.')).toBeInTheDocument();
    });
});
