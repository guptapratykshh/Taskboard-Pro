import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { Email as EmailIcon, Badge as BadgeIcon } from '@mui/icons-material';
import MainLayout from '../components/Layout/MainLayout';
import { useAuth } from '../contexts/AuthContext';

// Extend the User type to include authProvider
interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  authProvider?: string;
  badges?: Array<{
    name: string;
    description?: string;
    awardedAt: Date;
  }>;
}

const Profile: React.FC = () => {
  const { user } = useAuth() as { user: User | null };
  
  if (!user) {
    return null;
  }
  
  return (
    <MainLayout title="Profile">
      <Grid container spacing={4}>
        <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              src={user.profilePicture || ''}
              alt={user.name}
              sx={{
                width: 120,
                height: 120,
                mx: 'auto',
                mb: 2,
                fontSize: '3rem',
                bgcolor: 'primary.main'
              }}
            >
              {user.name.charAt(0)}
            </Avatar>
            <Typography variant="h5" gutterBottom>
              {user.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Account Information
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="Account Type"
                  secondary={user.authProvider === 'google' ? 'Google Account' : 'Email & Password'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Member Since"
                  secondary={new Date().toLocaleDateString()} // This should come from user data
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 8' } }}>
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Badges & Achievements
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {user.badges && user.badges.length > 0 ? (
              <Grid container spacing={2}>
                {user.badges.map((badge, index) => (
                  <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'secondary.main' }}>
                              <BadgeIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <Box>
                            <Typography variant="subtitle1">{badge.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {badge.description || 'Achievement unlocked'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Awarded on {new Date(badge.awardedAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <BadgeIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  No badges earned yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Complete tasks and projects to earn badges
                </Typography>
              </Box>
            )}
          </Paper>
          
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Activity Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Activity tracking coming soon
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </MainLayout>
  );
};

export default Profile; 