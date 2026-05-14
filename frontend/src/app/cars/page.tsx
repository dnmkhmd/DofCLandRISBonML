import { Metadata } from 'next';
import RentPageClient from './RentPageClient';
import { Suspense } from 'react';
export const metadata: Metadata = {
    title: 'Rent a Car | DiarRentCar AI',
    description: 'Find your perfect rental car from our premium fleet. Flexible terms and transparent pricing.',
};

export default function RentPage() {
    return (
        <Suspense fallback={<div className="container" style={{ padding: '8rem 0', textAlign: 'center' }}><div className="loader"></div></div>}>
            <RentPageClient />
        </Suspense>
    );
}
