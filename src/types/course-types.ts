// Course types used throughout the application
// These match the Event model and validation schema

export type CourseType = 'road' | 'trail' | 'triathlon' | 'cycle' | 'other'

export const COURSE_TYPES: readonly CourseType[] = ['road', 'trail', 'triathlon', 'cycle', 'other'] as const

export const COURSE_TYPE_LABELS: Record<CourseType, string> = {
	triathlon: 'Triathlon',
	trail: 'Trail Running',
	road: 'Road Running',
	other: 'Other',
	cycle: 'Cycling',
} as const

// Helper function to check if a string is a valid course type
export function isValidCourseType(value: string): value is CourseType {
	return COURSE_TYPES.includes(value as CourseType)
}

// Helper function to get course type label
export function getCourseTypeLabel(type: CourseType): string {
	return COURSE_TYPE_LABELS[type]
}
