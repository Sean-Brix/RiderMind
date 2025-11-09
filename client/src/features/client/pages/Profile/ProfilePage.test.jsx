/**
 * ProfilePage Unit Tests
 * Tests basic rendering and interactions using React Testing Library
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProfilePage from './ProfilePage';

describe('ProfilePage', () => {
  it('renders the avatar with user initials', () => {
    render(<ProfilePage />);
    
    // Check if avatar with initials is present
    const avatar = screen.getByText('JD'); // Juan Dela Cruz -> JD
    expect(avatar).toBeInTheDocument();
  });

  it('renders the Edit Profile button', () => {
    render(<ProfilePage />);
    
    // Check if edit button exists
    const editButton = screen.getByRole('button', { name: /edit profile/i });
    expect(editButton).toBeInTheDocument();
  });

  it('toggles edit mode when Edit button is clicked', () => {
    render(<ProfilePage />);
    
    const editButton = screen.getByRole('button', { name: /edit profile/i });
    
    // Click to enter edit mode
    fireEvent.click(editButton);
    
    // Button text should change to Cancel
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    
    // Click again to exit edit mode
    fireEvent.click(editButton);
    
    // Button should be back to Edit Profile
    expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
  });

  it('renders contact phone number', () => {
    render(<ProfilePage />);
    
    // Check if phone number is displayed
    const phone = screen.getByText('+63 912 345 6789');
    expect(phone).toBeInTheDocument();
  });

  it('renders contact email', () => {
    render(<ProfilePage />);
    
    // Check if email is displayed
    const email = screen.getByText('juan.delacruz@example.com');
    expect(email).toBeInTheDocument();
  });

  it('renders all information sections', () => {
    render(<ProfilePage />);
    
    // Check if section titles are present
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('renders quick action buttons', () => {
    render(<ProfilePage />);
    
    // Check if Call and Send Email buttons exist
    expect(screen.getByRole('button', { name: /call/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send email/i })).toBeInTheDocument();
  });

  it('handles call action', () => {
    // Mock window.location.href
    delete window.location;
    window.location = { href: '' };
    
    render(<ProfilePage />);
    
    const callButton = screen.getByRole('button', { name: /call/i });
    fireEvent.click(callButton);
    
    expect(window.location.href).toBe('tel:+63 912 345 6789');
  });

  it('handles email action', () => {
    // Mock window.location.href
    delete window.location;
    window.location = { href: '' };
    
    render(<ProfilePage />);
    
    const emailButton = screen.getByRole('button', { name: /send email/i });
    fireEvent.click(emailButton);
    
    expect(window.location.href).toBe('mailto:juan.delacruz@example.com');
  });
});
