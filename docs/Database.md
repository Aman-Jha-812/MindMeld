# Database Design

## Collections

### Users
| Field | Type | Description |
|-------|------|-------------|
| name | String | User's full name |
| email | String | Unique email address |
| password | String | Hashed password |
| avatar | Object | { url, publicId } |
| bio | String | User bio |
| skills | [String] | User skills |
| socialLinks | Object | { github, linkedin, twitter, website } |
| refreshToken | String | JWT refresh token |

### Workspaces
| Field | Type | Description |
|-------|------|-------------|
| name | String | Workspace name |
| description | String | Workspace description |
| owner | ObjectId | Reference to User |
| channels | [ObjectId] | Reference to Channel |
| members | [ObjectId] | Reference to User |
| inviteCode | String | Unique invite code |

### Channels
| Field | Type | Description |
|-------|------|-------------|
| name | String | Channel name |
| description | String | Channel description |
| workspace | ObjectId | Reference to Workspace |
| type | String | general, development, design, hr, custom |
| isPrivate | Boolean | Private channel flag |

### Messages
| Field | Type | Description |
|-------|------|-------------|
| channel | ObjectId | Reference to Channel |
| workspace | ObjectId | Reference to Workspace |
| sender | ObjectId | Reference to User |
| content | String | Message content |
| messageType | String | text, image, file, system |
| file | Object | { url, publicId, name, size, mimeType } |
| isEdited | Boolean | Edit flag |

### Tasks
| Field | Type | Description |
|-------|------|-------------|
| title | String | Task title |
| description | String | Task description |
| workspace | ObjectId | Reference to Workspace |
| assignedTo | ObjectId | Reference to User |
| status | String | todo, in_progress, completed |
| priority | String | low, medium, high, urgent |
| dueDate | Date | Due date |

### Notifications
| Field | Type | Description |
|-------|------|-------------|
| recipient | ObjectId | Reference to User |
| type | String | Notification type |
| title | String | Notification title |
| isRead | Boolean | Read status |

### Files
| Field | Type | Description |
|-------|------|-------------|
| originalName | String | Original filename |
| url | String | Cloudinary URL |
| publicId | String | Cloudinary public ID |
| uploadedBy | ObjectId | Reference to User |

### AIHistory
| Field | Type | Description |
|-------|------|-------------|
| user | ObjectId | Reference to User |
| prompt | String | User prompt |
| response | String | AI response |
| type | String | AI feature type |