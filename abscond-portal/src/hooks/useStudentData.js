import { useDataQuery } from './useDataQuery';

/**
 * Module-specific data fetching hooks for student operations
 */

export function useStudentProfile() {
  return useDataQuery('/students/me');
}

export function useCourseRegistration() {
  return useDataQuery('/students/course-registration');
}

export function useStudentResults() {
  return useDataQuery('/students/results');
}

export function useStudentFees() {
  return useDataQuery('/students/fees');
}

export function useStudentCalendar() {
  return useDataQuery('/students/calendar');
}

export function useStudentAnnouncements() {
  return useDataQuery('/students/announcements');
}

export function useStudentDownloads() {
  return useDataQuery('/students/downloads');
}

export function useClinicalPosting() {
  return useDataQuery('/students/clinical-posting');
}
