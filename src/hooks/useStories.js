import { useState, useEffect } from 'react';
import api from '../api/axios';

export const useStories = () => {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchStories = async () => {
        try {
            const { data } = await api.get('/stories');
            setStories(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStories();
    }, []);

    const createStory = async (text, images = []) => {
        try {
            const { data } = await api.post('/stories', { text, images });
            setStories(prev => [data, ...prev]);
            return data;
        } catch (err) {
            throw err;
        }
    };

    return { stories, loading, createStory, refreshStories: fetchStories };
};
