import { ICommand } from '../types/command';
import { addCc } from './addcc';
import { addAlumniRoles } from './addAlumniRoles';
import { addHw } from './addHw';
import { addHwChannel } from './addHwChannel';
import { addHwCheckerRole } from './addHwCheckerRole';
import { findCc } from './findcc';
import { log } from './log';
import { logHw } from './logHw';
import { logHwClass } from './logHwClass';
import { removeHw } from './removeHw';
import { removeHwChannel } from './removeHwChannel';
import { removeHwCheckerRole } from './removeHwCheckerRole';
import { removePermissions } from './removePermissions';
import { setMessageChannel } from './setMessageChannel';

export const Commands: Array<ICommand> = [
    addCc,
    addAlumniRoles,
    addHw,
    addHwChannel,
    addHwCheckerRole,
    findCc,
    log,
    logHw,
    logHwClass,
    removeHw,
    removeHwChannel,
    removeHwCheckerRole,
    removePermissions,
    setMessageChannel
];
