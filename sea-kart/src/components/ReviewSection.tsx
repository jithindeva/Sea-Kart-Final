"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star, Loader2, MessageSquare } from 'lucide-react';

import { getApiBase } from '@/config/api';

interface ReviewSectionProps {
  productId: string;
  productName: string;
}

const StarRating = ({ value }: { value: number }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 transition-colors ${
            value >= star
              ? 'fill-amber-400 text-amber-400'
              : 'text-slate-300 dark:text-slate-600'
          }`}
        />
      ))}
    </div>
  );
};

const ReviewSection = ({ productId, productName }: ReviewSectionProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      const res = await fetch(
        `${getApiBase()}/api/reviews/${productId}`
      );
      return res.json() as Promise<{
        reviews: any[];
        average: string | null;
        count: number;
      }>;
    },
    staleTime: 30_000,
  });

  return (
    <div className="mt-6">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-4">
        <MessageSquare className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-blue-950 dark:text-white text-lg">
          Customer Reviews — {productName}
        </h3>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          {/* Average Rating */}
          {data?.count && data.count > 0 ? (
            <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 mb-6">
              <span className="text-4xl font-black text-amber-500">{data.average}</span>
              <div>
                <StarRating value={Math.round(Number(data.average))} />
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Based on {data.count} {data.count === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-sm">
              No reviews yet.
            </div>
          )}

          {/* Customer Review List */}
          {data?.reviews && data.reviews.length > 0 && (
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {data.reviews.map((r: any) => (
                <div
                  key={r._id}
                  className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center font-bold text-blue-600 dark:text-blue-300 text-sm">
                      {(r.userId?.name || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white text-sm">
                        {r.userId?.name || 'Anonymous'}
                      </p>
                      <StarRating value={r.rating} />
                    </div>
                    <span className="ml-auto text-xs text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed pl-11">
                    {r.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReviewSection;
