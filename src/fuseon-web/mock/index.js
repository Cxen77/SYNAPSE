// Registers every demo API handler. Each section owns one handler file.
import './handlers/core';
import './handlers/home';
import './handlers/users';
import './handlers/teams';
import './handlers/events';
import './handlers/chat';
import './handlers/forums';

export { mockAdapter } from './server';
