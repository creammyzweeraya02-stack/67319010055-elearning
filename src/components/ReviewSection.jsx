import React, { useState, useEffect } from 'react';
import { Star, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const ReviewSection = ({ courseId }) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Fetch reviews
    useEffect(() => {
        const fetchReviews = async () => {
            // Check if courseId is a mock/dev ID (legacy mock data starts with "course-")
            const isMockId = courseId && (courseId.toString().startsWith('course-') || courseId.toString().startsWith('dev-'));

            if (isMockId) {
                console.log("Mock course detected, skipping Supabase review fetch");
                setReviews([]); // Or mock reviews if desired
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('reviews')
                    .select(`
                        id,
                        rating,
                        comment,
                        created_at,
                        user_id,
                        profiles (
                            username,
                            avatar_url
                        )
                    `)
                    .eq('course_id', courseId)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setReviews(data || []);
            } catch (err) {
                console.error('Error fetching reviews:', err);
                // Even on error, stop loading
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            fetchReviews();
        }
    }, [courseId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return;
        if (!user) {
            alert('Please login to write a review');
            return;
        }

        setSubmitting(true);
        setError(null);

        setError(null);

        try {
            const newReview = {
                course_id: courseId,
                user_id: user.id,
                rating,
                comment,
            };

            const { data, error } = await supabase
                .from('reviews')
                .insert([newReview])
                .select(`
                    id,
                    rating,
                    comment,
                    created_at,
                    user_id,
                    profiles (
                        username,
                        avatar_url
                    )
                `)
                .single();

            if (error) throw error;
            if (!data) throw new Error("No data returned from server");

            console.log("Successfully posted review:", data);
            setReviews([data, ...reviews]);
            setComment('');
            setRating(0);
        } catch (err) {
            console.error('Error submitting review:', err);
            const errMsg = err.message || 'Failed to submit review';
            setError(errMsg);
            alert(errMsg); // Add alert for immediate feedback
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (reviewId) => {
        if (!confirm('Are you sure you want to delete this review?')) return;

        try {
            const { error } = await supabase
                .from('reviews')
                .delete()
                .eq('id', reviewId);

            if (error) throw error;

            setReviews(reviews.filter(r => r.id !== reviewId));
        } catch (err) {
            console.error('Error deleting review:', err);
            alert('Failed to delete review');
        }
    };

    if (loading) return <div className="text-center py-4 text-gray-500">Loading reviews...</div>;

    return (
        <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Student Reviews ({reviews.length})</h3>

            {/* Write Review */}
            {user ? (
                <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Write a review</h4>
                    <div className="flex items-center mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className="focus:outline-none transition-transform hover:scale-110"
                            >
                                <Star
                                    className={`w-6 h-6 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                />
                            </button>
                        ))}
                    </div>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm transition-shadow focus:shadow-md"
                        rows="3"
                        placeholder="Share your experience..."
                    />
                    {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                    <button
                        onClick={handleSubmit}
                        disabled={rating === 0 || submitting}
                        className="mt-3 px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Posting...
                            </>
                        ) : (
                            'Post Review'
                        )}
                    </button>
                </div>
            ) : (
                <div className="mb-8 p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                    Please <a href="/login" className="underline font-bold">login</a> to write a review.
                </div>
            )}

            {/* Review List */}
            <div className="space-y-6">
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0 relative group">
                            {user && user.id === review.user_id && (
                                <button
                                    onClick={() => handleDelete(review.id)}
                                    className="absolute top-0 right-0 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Delete review"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                    <div className="h-8 w-8 rounded-full bg-primary-light/20 flex items-center justify-center overflow-hidden mr-3">
                                        {review.profiles?.avatar_url ? (
                                            <img src={review.profiles.avatar_url} alt={review.profiles.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-primary font-bold text-xs">
                                                {review.profiles?.username?.charAt(0) || 'U'}
                                            </span>
                                        )}
                                    </div>
                                    <span className="font-medium text-gray-900">
                                        {review.profiles?.username || 'Anonymous User'}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                    {new Date(review.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex items-center mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`}
                                    />
                                ))}
                            </div>
                            <p className="text-gray-600 text-sm">{review.comment}</p>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <Star className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 italic">No reviews yet. Be the first to review!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewSection;
