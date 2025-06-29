import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { fetchUserByClerkId } from '@/services/user.services'
import { LocaleParams } from '@/lib/generateStaticParams'

import ProfileClient from './ProfileClient'

export default async function ProfilePage({ params }: { params: Promise<LocaleParams> }) {
	const { locale } = await params
	const clerkUser = await currentUser()

	if (!clerkUser) {
		redirect(`/${locale}/sign-in`)
	}

	const user = await fetchUserByClerkId(clerkUser.id)

	const serializedClerkUser = {
		username: clerkUser.username,
		lastName: clerkUser.lastName,
		imageUrl: clerkUser.imageUrl,
		id: clerkUser.id,
		firstName: clerkUser.firstName,
		emailAddresses: clerkUser.emailAddresses.map(email => ({
			id: email.id,
			emailAddress: email.emailAddress,
		})),
	}

	return <ProfileClient locale={locale} user={user} clerkUser={serializedClerkUser} />
}
