USE [LMS_Materials]
GO

/****** Object:  Table [lms].[Users]    Script Date: 10/30/2025 2:05:35 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [lms].[Users](
	[UserId] [int] IDENTITY(1,1) NOT NULL,
	[Username] [nvarchar](100) NOT NULL,
	[PasswordHash] [nvarchar](255) NOT NULL,
	[Email] [nvarchar](255) NULL,
	[FullName] [nvarchar](255) NULL,
	[Status] [tinyint] NOT NULL,
	[CreatedAt] [datetime2](7) NOT NULL,
	[UpdatedAt] [datetime2](7) NOT NULL,
	[PasswordSalt] [varbinary](16) NULL,
	[PasswordHash2] [varbinary](32) NULL,
	[LegacyPassword] [nvarchar](256) NULL,
PRIMARY KEY CLUSTERED 
(
	[UserId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[Username] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[Email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [lms].[Users] ADD  DEFAULT ((1)) FOR [Status]
GO

ALTER TABLE [lms].[Users] ADD  DEFAULT (sysutcdatetime()) FOR [CreatedAt]
GO

ALTER TABLE [lms].[Users] ADD  DEFAULT (sysutcdatetime()) FOR [UpdatedAt]
GO

ALTER TABLE [lms].[Users]  WITH CHECK ADD  CONSTRAINT [CK_Users_Status] CHECK  (([Status]=(1) OR [Status]=(0)))
GO

ALTER TABLE [lms].[Users] CHECK CONSTRAINT [CK_Users_Status]
GO


USE [LMS_Materials]
GO

/****** Object:  Table [lms].[UserRoles]    Script Date: 10/30/2025 2:06:46 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [lms].[UserRoles](
	[UserId] [int] NOT NULL,
	[RoleId] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[UserId] ASC,
	[RoleId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [lms].[UserRoles]  WITH CHECK ADD  CONSTRAINT [FK_UserRoles_Role] FOREIGN KEY([RoleId])
REFERENCES [lms].[Roles] ([RoleId])
GO

ALTER TABLE [lms].[UserRoles] CHECK CONSTRAINT [FK_UserRoles_Role]
GO

ALTER TABLE [lms].[UserRoles]  WITH CHECK ADD  CONSTRAINT [FK_UserRoles_User] FOREIGN KEY([UserId])
REFERENCES [lms].[Users] ([UserId])
GO

ALTER TABLE [lms].[UserRoles] CHECK CONSTRAINT [FK_UserRoles_User]
GO

USE [LMS_Materials]
GO

/****** Object:  Table [lms].[UserActions]    Script Date: 10/30/2025 2:07:09 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [lms].[UserActions](
	[UserId] [int] NOT NULL,
	[ActionId] [int] NOT NULL,
	[IsDenied] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[UserId] ASC,
	[ActionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [lms].[UserActions] ADD  DEFAULT ((0)) FOR [IsDenied]
GO

ALTER TABLE [lms].[UserActions]  WITH CHECK ADD  CONSTRAINT [FK_UserActions_Action] FOREIGN KEY([ActionId])
REFERENCES [lms].[Actions] ([ActionId])
GO

ALTER TABLE [lms].[UserActions] CHECK CONSTRAINT [FK_UserActions_Action]
GO

ALTER TABLE [lms].[UserActions]  WITH CHECK ADD  CONSTRAINT [FK_UserActions_User] FOREIGN KEY([UserId])
REFERENCES [lms].[Users] ([UserId])
GO

ALTER TABLE [lms].[UserActions] CHECK CONSTRAINT [FK_UserActions_User]
GO

ALTER TABLE [lms].[UserActions]  WITH CHECK ADD  CONSTRAINT [CK_UserActions_Deny] CHECK  (([IsDenied]=(1) OR [IsDenied]=(0)))
GO

ALTER TABLE [lms].[UserActions] CHECK CONSTRAINT [CK_UserActions_Deny]
GO

USE [LMS_Materials]
GO

/****** Object:  Table [lms].[Roles]    Script Date: 10/30/2025 2:07:32 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [lms].[Roles](
	[RoleId] [int] IDENTITY(1,1) NOT NULL,
	[RoleCode] [nvarchar](50) NOT NULL,
	[RoleName] [nvarchar](100) NOT NULL,
	[Status] [tinyint] NOT NULL,
	[CreatedAt] [datetime2](7) NOT NULL,
	[UpdatedAt] [datetime2](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[RoleId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[RoleCode] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [lms].[Roles] ADD  DEFAULT ((1)) FOR [Status]
GO

ALTER TABLE [lms].[Roles] ADD  DEFAULT (sysutcdatetime()) FOR [CreatedAt]
GO

ALTER TABLE [lms].[Roles] ADD  DEFAULT (sysutcdatetime()) FOR [UpdatedAt]
GO

ALTER TABLE [lms].[Roles]  WITH CHECK ADD  CONSTRAINT [CK_Roles_Status] CHECK  (([Status]=(1) OR [Status]=(0)))
GO

ALTER TABLE [lms].[Roles] CHECK CONSTRAINT [CK_Roles_Status]
GO


USE [LMS_Materials]
GO

/****** Object:  Table [lms].[RoleActions]    Script Date: 10/30/2025 2:07:45 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [lms].[RoleActions](
	[RoleId] [int] NOT NULL,
	[ActionId] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[RoleId] ASC,
	[ActionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [lms].[RoleActions]  WITH CHECK ADD  CONSTRAINT [FK_RoleActions_Action] FOREIGN KEY([ActionId])
REFERENCES [lms].[Actions] ([ActionId])
GO

ALTER TABLE [lms].[RoleActions] CHECK CONSTRAINT [FK_RoleActions_Action]
GO

ALTER TABLE [lms].[RoleActions]  WITH CHECK ADD  CONSTRAINT [FK_RoleActions_Role] FOREIGN KEY([RoleId])
REFERENCES [lms].[Roles] ([RoleId])
GO

ALTER TABLE [lms].[RoleActions] CHECK CONSTRAINT [FK_RoleActions_Role]
GO


USE [LMS_Materials]
GO

/****** Object:  Table [lms].[MaterialVersions]    Script Date: 10/30/2025 2:08:04 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [lms].[MaterialVersions](
	[VersionId] [int] IDENTITY(1,1) NOT NULL,
	[MaterialId] [int] NOT NULL,
	[VersionNo] [int] NOT NULL,
	[HtmlContent] [nvarchar](max) NOT NULL,
	[Notes] [nvarchar](500) NULL,
	[CreatedBy] [int] NOT NULL,
	[CreatedAt] [datetime2](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[VersionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_MV] UNIQUE NONCLUSTERED 
(
	[MaterialId] ASC,
	[VersionNo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [lms].[MaterialVersions] ADD  DEFAULT (sysutcdatetime()) FOR [CreatedAt]
GO

ALTER TABLE [lms].[MaterialVersions]  WITH CHECK ADD  CONSTRAINT [FK_MV_Material] FOREIGN KEY([MaterialId])
REFERENCES [lms].[Materials] ([MaterialId])
GO

ALTER TABLE [lms].[MaterialVersions] CHECK CONSTRAINT [FK_MV_Material]
GO

ALTER TABLE [lms].[MaterialVersions]  WITH CHECK ADD  CONSTRAINT [FK_MV_User] FOREIGN KEY([CreatedBy])
REFERENCES [lms].[Users] ([UserId])
GO

ALTER TABLE [lms].[MaterialVersions] CHECK CONSTRAINT [FK_MV_User]
GO


USE [LMS_Materials]
GO

/****** Object:  Table [lms].[MaterialUserPerm]    Script Date: 10/30/2025 2:08:18 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [lms].[MaterialUserPerm](
	[MaterialId] [int] NOT NULL,
	[UserId] [int] NOT NULL,
	[ActionId] [int] NOT NULL,
	[Effect] [tinyint] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MaterialId] ASC,
	[UserId] ASC,
	[ActionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [lms].[MaterialUserPerm]  WITH CHECK ADD  CONSTRAINT [FK_MUP_Act] FOREIGN KEY([ActionId])
REFERENCES [lms].[Actions] ([ActionId])
GO

ALTER TABLE [lms].[MaterialUserPerm] CHECK CONSTRAINT [FK_MUP_Act]
GO

ALTER TABLE [lms].[MaterialUserPerm]  WITH CHECK ADD  CONSTRAINT [FK_MUP_Mat] FOREIGN KEY([MaterialId])
REFERENCES [lms].[Materials] ([MaterialId])
GO

ALTER TABLE [lms].[MaterialUserPerm] CHECK CONSTRAINT [FK_MUP_Mat]
GO

ALTER TABLE [lms].[MaterialUserPerm]  WITH CHECK ADD  CONSTRAINT [FK_MUP_User] FOREIGN KEY([UserId])
REFERENCES [lms].[Users] ([UserId])
GO

ALTER TABLE [lms].[MaterialUserPerm] CHECK CONSTRAINT [FK_MUP_User]
GO

ALTER TABLE [lms].[MaterialUserPerm]  WITH CHECK ADD  CONSTRAINT [CK_MUP_Effect] CHECK  (([Effect]=(1) OR [Effect]=(0)))
GO

ALTER TABLE [lms].[MaterialUserPerm] CHECK CONSTRAINT [CK_MUP_Effect]
GO


USE [LMS_Materials]
GO

/****** Object:  Table [lms].[Materials]    Script Date: 10/30/2025 2:08:30 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [lms].[Materials](
	[MaterialId] [int] IDENTITY(1,1) NOT NULL,
	[Title] [nvarchar](255) NOT NULL,
	[Slug] [nvarchar](255) NULL,
	[OwnerUserId] [int] NOT NULL,
	[CourseId] [int] NULL,
	[Status] [smallint] NOT NULL,
	[HtmlContent] [nvarchar](max) NULL,
	[CreatedAt] [datetime2](7) NOT NULL,
	[UpdatedAt] [datetime2](7) NOT NULL,
	[SourceFilePath] [nvarchar](400) NULL,
	[SourceFileType] [nvarchar](10) NULL,
	[SourceFileSize] [int] NULL,
	[SourceHash] [nvarchar](128) NULL,
PRIMARY KEY CLUSTERED 
(
	[MaterialId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[Slug] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [lms].[Materials] ADD  DEFAULT ((0)) FOR [Status]
GO

ALTER TABLE [lms].[Materials] ADD  DEFAULT (sysutcdatetime()) FOR [CreatedAt]
GO

ALTER TABLE [lms].[Materials] ADD  DEFAULT (sysutcdatetime()) FOR [UpdatedAt]
GO

ALTER TABLE [lms].[Materials]  WITH CHECK ADD  CONSTRAINT [FK_Materials_Owner] FOREIGN KEY([OwnerUserId])
REFERENCES [lms].[Users] ([UserId])
GO

ALTER TABLE [lms].[Materials] CHECK CONSTRAINT [FK_Materials_Owner]
GO

ALTER TABLE [lms].[Materials]  WITH CHECK ADD  CONSTRAINT [CK_Materials_Status] CHECK  (([Status]=(3) OR [Status]=(2) OR [Status]=(1) OR [Status]=(0)))
GO

ALTER TABLE [lms].[Materials] CHECK CONSTRAINT [CK_Materials_Status]
GO


USE [LMS_Materials]
GO

/****** Object:  Table [lms].[MaterialRolePerm]    Script Date: 10/30/2025 2:08:41 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [lms].[MaterialRolePerm](
	[MaterialId] [int] NOT NULL,
	[RoleId] [int] NOT NULL,
	[ActionId] [int] NOT NULL,
	[Effect] [tinyint] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MaterialId] ASC,
	[RoleId] ASC,
	[ActionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [lms].[MaterialRolePerm]  WITH CHECK ADD  CONSTRAINT [FK_MRP_Act] FOREIGN KEY([ActionId])
REFERENCES [lms].[Actions] ([ActionId])
GO

ALTER TABLE [lms].[MaterialRolePerm] CHECK CONSTRAINT [FK_MRP_Act]
GO

ALTER TABLE [lms].[MaterialRolePerm]  WITH CHECK ADD  CONSTRAINT [FK_MRP_Mat] FOREIGN KEY([MaterialId])
REFERENCES [lms].[Materials] ([MaterialId])
GO

ALTER TABLE [lms].[MaterialRolePerm] CHECK CONSTRAINT [FK_MRP_Mat]
GO

ALTER TABLE [lms].[MaterialRolePerm]  WITH CHECK ADD  CONSTRAINT [FK_MRP_Role] FOREIGN KEY([RoleId])
REFERENCES [lms].[Roles] ([RoleId])
GO

ALTER TABLE [lms].[MaterialRolePerm] CHECK CONSTRAINT [FK_MRP_Role]
GO

ALTER TABLE [lms].[MaterialRolePerm]  WITH CHECK ADD  CONSTRAINT [CK_MRP_Effect] CHECK  (([Effect]=(1) OR [Effect]=(0)))
GO

ALTER TABLE [lms].[MaterialRolePerm] CHECK CONSTRAINT [CK_MRP_Effect]
GO


USE [LMS_Materials]
GO

/****** Object:  Table [lms].[MaterialDocument]    Script Date: 10/30/2025 2:08:52 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [lms].[MaterialDocument](
	[MaterialId] [int] NOT NULL,
	[DocumentId] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MaterialId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[DocumentId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [lms].[MaterialDocument]  WITH CHECK ADD  CONSTRAINT [FK_MD_Document] FOREIGN KEY([DocumentId])
REFERENCES [conv].[Documents] ([DocumentId])
GO

ALTER TABLE [lms].[MaterialDocument] CHECK CONSTRAINT [FK_MD_Document]
GO

ALTER TABLE [lms].[MaterialDocument]  WITH CHECK ADD  CONSTRAINT [FK_MD_Material] FOREIGN KEY([MaterialId])
REFERENCES [lms].[Materials] ([MaterialId])
GO

ALTER TABLE [lms].[MaterialDocument] CHECK CONSTRAINT [FK_MD_Material]
GO


USE [LMS_Materials]
GO

/****** Object:  Table [lms].[MaterialConversionJobs]    Script Date: 10/30/2025 2:09:05 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [lms].[MaterialConversionJobs](
	[JobId] [int] IDENTITY(1,1) NOT NULL,
	[MaterialId] [int] NOT NULL,
	[Status] [tinyint] NOT NULL,
	[Engine] [nvarchar](50) NULL,
	[LogText] [nvarchar](max) NULL,
	[StartedAt] [datetime2](7) NULL,
	[FinishedAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[JobId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [lms].[MaterialConversionJobs] ADD  DEFAULT ((0)) FOR [Status]
GO

ALTER TABLE [lms].[MaterialConversionJobs]  WITH CHECK ADD  CONSTRAINT [FK_MCJ_Material] FOREIGN KEY([MaterialId])
REFERENCES [lms].[Materials] ([MaterialId])
GO

ALTER TABLE [lms].[MaterialConversionJobs] CHECK CONSTRAINT [FK_MCJ_Material]
GO


USE [LMS_Materials]
GO

/****** Object:  Table [lms].[AuthRefreshTokens]    Script Date: 10/30/2025 2:09:20 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [lms].[AuthRefreshTokens](
	[TokenId] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [int] NOT NULL,
	[Token] [nvarchar](200) NOT NULL,
	[ExpireAt] [datetime] NOT NULL,
	[IsRevoked] [bit] NULL,
	[CreatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[TokenId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [lms].[AuthRefreshTokens] ADD  DEFAULT ((0)) FOR [IsRevoked]
GO

ALTER TABLE [lms].[AuthRefreshTokens] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO

ALTER TABLE [lms].[AuthRefreshTokens]  WITH CHECK ADD  CONSTRAINT [FK_AuthRefreshTokens_Users] FOREIGN KEY([UserId])
REFERENCES [lms].[Users] ([UserId])
GO

ALTER TABLE [lms].[AuthRefreshTokens] CHECK CONSTRAINT [FK_AuthRefreshTokens_Users]
GO


USE [LMS_Materials]
GO

/****** Object:  Table [lms].[Actions]    Script Date: 10/30/2025 2:09:32 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [lms].[Actions](
	[ActionId] [int] IDENTITY(1,1) NOT NULL,
	[ActionCode] [nvarchar](100) NOT NULL,
	[ActionName] [nvarchar](200) NOT NULL,
	[Path] [nvarchar](255) NULL,
	[HttpMethod] [nvarchar](10) NULL,
	[MenuGroup] [nvarchar](50) NULL,
	[ParentId] [int] NULL,
	[SortOrder] [int] NOT NULL,
	[IsMenu] [bit] NOT NULL,
	[Icon] [nvarchar](50) NULL,
	[IsPublic] [bit] NOT NULL,
	[CreatedAt] [datetime2](7) NOT NULL,
	[UpdatedAt] [datetime2](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ActionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[ActionCode] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [lms].[Actions] ADD  DEFAULT ((0)) FOR [SortOrder]
GO

ALTER TABLE [lms].[Actions] ADD  DEFAULT ((0)) FOR [IsMenu]
GO

ALTER TABLE [lms].[Actions] ADD  DEFAULT ((0)) FOR [IsPublic]
GO

ALTER TABLE [lms].[Actions] ADD  DEFAULT (sysutcdatetime()) FOR [CreatedAt]
GO

ALTER TABLE [lms].[Actions] ADD  DEFAULT (sysutcdatetime()) FOR [UpdatedAt]
GO

ALTER TABLE [lms].[Actions]  WITH CHECK ADD  CONSTRAINT [FK_Actions_Parent] FOREIGN KEY([ParentId])
REFERENCES [lms].[Actions] ([ActionId])
GO

ALTER TABLE [lms].[Actions] CHECK CONSTRAINT [FK_Actions_Parent]
GO

ALTER TABLE [lms].[Actions]  WITH CHECK ADD  CONSTRAINT [CK_Actions_IsMenu] CHECK  (([IsMenu]=(1) OR [IsMenu]=(0)))
GO

ALTER TABLE [lms].[Actions] CHECK CONSTRAINT [CK_Actions_IsMenu]
GO

ALTER TABLE [lms].[Actions]  WITH CHECK ADD  CONSTRAINT [CK_Actions_IsPublic] CHECK  (([IsPublic]=(1) OR [IsPublic]=(0)))
GO

ALTER TABLE [lms].[Actions] CHECK CONSTRAINT [CK_Actions_IsPublic]
GO

USE [LMS_Materials]
GO

/****** Object:  Table [conv].[Cells]    Script Date: 10/30/2025 4:25:48 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [conv].[Cells](
	[CellId] [int] IDENTITY(1,1) NOT NULL,
	[ParagraphId] [int] NULL,
	[RowIndex] [int] NULL,
	[ColumnIndex] [int] NULL,
	[CellText] [nvarchar](max) NULL,
	[ImagePath] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[CellId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [conv].[Cells]  WITH CHECK ADD  CONSTRAINT [FK_conv_Cells_Paragraphs] FOREIGN KEY([ParagraphId])
REFERENCES [conv].[Paragraphs] ([ParagraphId])
GO

ALTER TABLE [conv].[Cells] CHECK CONSTRAINT [FK_conv_Cells_Paragraphs]
GO


USE [LMS_Materials]
GO

/****** Object:  Table [conv].[Documents]    Script Date: 10/30/2025 4:27:27 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [conv].[Documents](
	[DocumentId] [int] IDENTITY(1,1) NOT NULL,
	[FileName] [nvarchar](255) NULL,
	[UploadDate] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[DocumentId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [conv].[Documents] ADD  CONSTRAINT [DF_conv_Documents_UploadDate]  DEFAULT (getdate()) FOR [UploadDate]
GO


USE [LMS_Materials]
GO

/****** Object:  Table [conv].[Paragraphs]    Script Date: 10/30/2025 4:27:43 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [conv].[Paragraphs](
	[ParagraphId] [int] IDENTITY(1,1) NOT NULL,
	[SectionId] [int] NULL,
	[ParagraphType] [nvarchar](50) NULL,
	[ParagraphOrder] [int] NULL,
	[ContentText] [nvarchar](max) NULL,
	[ImagePath] [nvarchar](500) NULL,
	[FormulaOMML] [nvarchar](max) NULL,
	[AnalyzedParametersJson] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[ParagraphId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [conv].[Paragraphs]  WITH CHECK ADD  CONSTRAINT [FK_conv_Paragraphs_Sections] FOREIGN KEY([SectionId])
REFERENCES [conv].[Sections] ([SectionId])
GO

ALTER TABLE [conv].[Paragraphs] CHECK CONSTRAINT [FK_conv_Paragraphs_Sections]
GO


USE [LMS_Materials]
GO

/****** Object:  Table [conv].[Sections]    Script Date: 10/30/2025 4:27:59 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [conv].[Sections](
	[SectionId] [int] IDENTITY(1,1) NOT NULL,
	[DocumentId] [int] NULL,
	[SectionTitle] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[SectionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [conv].[Sections]  WITH CHECK ADD  CONSTRAINT [FK_conv_Sections_Documents] FOREIGN KEY([DocumentId])
REFERENCES [conv].[Documents] ([DocumentId])
GO

ALTER TABLE [conv].[Sections] CHECK CONSTRAINT [FK_conv_Sections_Documents]
GO







