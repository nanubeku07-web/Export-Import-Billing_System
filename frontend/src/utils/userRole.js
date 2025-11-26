// Utility function to get current user role
export const getUserRole = () => {
    try {
        const profile = localStorage.getItem('profile');
        if (profile) {
            const userData = JSON.parse(profile);
            return userData.is_staff ? 'admin' : 'user';
        }
    } catch (error) {
        console.error('Error parsing user profile:', error);
    }
    return 'user';
};

export const isAdmin = () => getUserRole() === 'admin';
export const isUser = () => getUserRole() === 'user';
