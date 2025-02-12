const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const Blog = require('../models/blog-model');
const UserData = require('../models/user-model');
const { CgPathCrop } = require('react-icons/cg');

