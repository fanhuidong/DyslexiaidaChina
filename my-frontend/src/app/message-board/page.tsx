"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { MessageBoard } from '@/components/MessageBoard/MessageBoard';

export default function MessageBoardPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">留言板</h1>
          <p className="text-gray-600">在这里分享你的想法，与其他用户交流讨论</p>
        </div>
        <MessageBoard />
      </div>
    </div>
  );
}
