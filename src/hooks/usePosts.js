import { useInfiniteQuery } from '@tanstack/react-query';
import api from '../api/axios';

export const usePosts = (feedType) => {
    const filterParam = feedType === "Following" ? "following" : "";

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isLoading,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ['posts', feedType],
        queryFn: async ({ pageParam = 1 }) => {
            const { data } = await api.get(`/posts?pageNumber=${pageParam}&filter=${filterParam}`);
            return data;
        },
        getNextPageParam: (lastPage) => {
            return lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined;
        },
        staleTime: 60000, // 1 minute
    });

    // Flatten pages into a single list of posts
    const posts = data?.pages.flatMap(page => page.posts.map(post => ({
        id: post._id,
        author: post.user.name,
        username: post.user.username,
        role: post.user.course ? `${post.user.course} Student` : "Member",
        time: new Date(post.createdAt).toLocaleDateString(),
        text: post.content,
        image: post.image,
        likes: post.likes.length,
        comments: post.comments,
        avatar: post.user.profilePic,
        userId: post.user._id
    }))) || [];

    return {
        posts,
        isLoading,
        fetchNextPage,
        hasNextPage: !!hasNextPage,
        isFetchingNextPage
    };
};
