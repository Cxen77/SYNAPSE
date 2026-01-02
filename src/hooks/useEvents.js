import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import toast from 'react-hot-toast';

export const useEvents = () => {
    const queryClient = useQueryClient();

    const { data: events = [], isLoading, error, refetch } = useQuery({
        queryKey: ['events'],
        queryFn: async () => {
            const { data } = await api.get('/events');
            return data.events || [];
        }
    });

    const createEventMutation = useMutation({
        mutationFn: (newEvent) => api.post('/events', newEvent),
        onSuccess: () => {
            queryClient.invalidateQueries(['events']);
            toast.success('Event created!');
        },
        onError: (err) => {
            console.error(err);
            toast.error('Failed to create event');
        }
    });

    return {
        events,
        loading: isLoading,
        error,
        refetch,
        createEvent: createEventMutation.mutateAsync
    };
};
